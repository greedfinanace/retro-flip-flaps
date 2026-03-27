import { useEffect, useRef, useState } from 'react';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

type PairRole = 'idle' | 'display' | 'controller';
type PairStatus =
  | 'idle'
  | 'creating-display-code'
  | 'display-code-ready'
  | 'creating-response-code'
  | 'response-code-ready'
  | 'connecting'
  | 'connected'
  | 'error';

type PairingSignal = {
  type: 'sync';
  message: string;
  speed: number;
};

export type PairingSnapshot = {
  message: string;
  speed: number;
};

type UsePairingOptions = {
  onRemoteControl: (snapshot: PairingSnapshot) => void;
};

export type PairingViewModel = {
  role: PairRole;
  status: PairStatus;
  statusLabel: string;
  verificationNumber: string;
  displayCode: string;
  controllerCode: string;
  remoteDisplayCodeInput: string;
  remoteResponseCodeInput: string;
  error: string | null;
  isConnected: boolean;
  canSend: boolean;
  setRemoteDisplayCodeInput: (value: string) => void;
  setRemoteResponseCodeInput: (value: string) => void;
  createDisplayCode: () => Promise<void>;
  createControllerCode: () => Promise<void>;
  completeDisplayPairing: () => Promise<void>;
  resetPairing: () => void;
  sendControlState: (snapshot: PairingSnapshot) => void;
};

function encodeSignal(description: RTCSessionDescriptionInit): string {
  const json = JSON.stringify(description);
  const bytes = new TextEncoder().encode(json);
  let binary = '';

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeSignal(code: string): RTCSessionDescriptionInit {
  const compact = code.trim().replace(/\s+/g, '');
  const normalized = compact.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(`${normalized}${padding}`);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  return JSON.parse(json) as RTCSessionDescriptionInit;
}

function createVerificationNumber(source: string): string {
  let hash = 2166136261;

  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  const digits = String(hash >>> 0).slice(-6).padStart(6, '0');
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

function getStatusLabel(status: PairStatus, role: PairRole): string {
  switch (status) {
    case 'creating-display-code':
      return 'Creating display code';
    case 'display-code-ready':
      return role === 'display' ? 'Display code ready' : 'Display code loaded';
    case 'creating-response-code':
      return 'Creating response code';
    case 'response-code-ready':
      return role === 'controller' ? 'Response code ready' : 'Waiting for response code';
    case 'connecting':
      return 'Connecting devices';
    case 'connected':
      return 'Paired and live';
    case 'error':
      return 'Pairing error';
    default:
      return 'Not paired';
  }
}

function waitForIceGatheringComplete(peerConnection: RTCPeerConnection): Promise<void> {
  if (peerConnection.iceGatheringState === 'complete') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      peerConnection.removeEventListener('icegatheringstatechange', handleIceStateChange);
      resolve();
    }, 4000);

    function handleIceStateChange() {
      if (peerConnection.iceGatheringState === 'complete') {
        window.clearTimeout(timeoutId);
        peerConnection.removeEventListener('icegatheringstatechange', handleIceStateChange);
        resolve();
      }
    }

    peerConnection.addEventListener('icegatheringstatechange', handleIceStateChange);
  });
}

export function usePairing({ onRemoteControl }: UsePairingOptions): PairingViewModel {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const roleRef = useRef<PairRole>('idle');
  const onRemoteControlRef = useRef(onRemoteControl);

  const [role, setRole] = useState<PairRole>('idle');
  const [status, setStatus] = useState<PairStatus>('idle');
  const [displayCode, setDisplayCode] = useState('');
  const [controllerCode, setControllerCode] = useState('');
  const [remoteDisplayCodeInput, setRemoteDisplayCodeInput] = useState('');
  const [remoteResponseCodeInput, setRemoteResponseCodeInput] = useState('');
  const [verificationNumber, setVerificationNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    onRemoteControlRef.current = onRemoteControl;
  }, [onRemoteControl]);

  useEffect(() => {
    return () => {
      dataChannelRef.current?.close();
      peerConnectionRef.current?.close();
    };
  }, []);

  function teardownConnection() {
    dataChannelRef.current?.close();
    peerConnectionRef.current?.close();
    dataChannelRef.current = null;
    peerConnectionRef.current = null;
    setIsConnected(false);
  }

  function resetPairing() {
    teardownConnection();
    setRole('idle');
    setStatus('idle');
    setDisplayCode('');
    setControllerCode('');
    setRemoteDisplayCodeInput('');
    setRemoteResponseCodeInput('');
    setVerificationNumber('');
    setError(null);
  }

  function attachDataChannel(channel: RTCDataChannel, currentRole: Exclude<PairRole, 'idle'>) {
    dataChannelRef.current = channel;

    channel.addEventListener('open', () => {
      setIsConnected(true);
      setStatus('connected');
      setError(null);
    });

    channel.addEventListener('close', () => {
      setIsConnected(false);

      if (peerConnectionRef.current?.connectionState === 'connected') {
        return;
      }

      setStatus('error');
      setError('Connection closed. Generate a new pairing code to reconnect.');
    });

    channel.addEventListener('error', () => {
      setStatus('error');
      setError('Pairing channel error. Reset pairing and try again.');
    });

    channel.addEventListener('message', (event) => {
      if (currentRole !== 'display' || typeof event.data !== 'string') {
        return;
      }

      try {
        const parsed = JSON.parse(event.data) as PairingSignal;

        if (parsed.type !== 'sync') {
          return;
        }

        onRemoteControlRef.current({
          message: typeof parsed.message === 'string' ? parsed.message : '',
          speed: typeof parsed.speed === 'number' ? parsed.speed : 1,
        });
      } catch {
        setStatus('error');
        setError('Received malformed pairing data from the controller device.');
      }
    });
  }

  function wirePeerConnection(peerConnection: RTCPeerConnection, currentRole: Exclude<PairRole, 'idle'>) {
    if (currentRole === 'controller') {
      peerConnection.addEventListener('datachannel', (event) => {
        attachDataChannel(event.channel, currentRole);
      });
    }

    peerConnection.addEventListener('connectionstatechange', () => {
      switch (peerConnection.connectionState) {
        case 'connecting':
          setStatus('connecting');
          break;
        case 'connected':
          setStatus('connected');
          setError(null);
          break;
        case 'failed':
          setStatus('error');
          setError('Peer connection failed. Reset pairing and try again.');
          break;
        case 'disconnected':
          setIsConnected(false);
          setStatus('error');
          setError('Peer connection dropped. Generate a new pairing code.');
          break;
        default:
          break;
      }
    });
  }

  async function createDisplayCode() {
    if (typeof window === 'undefined' || !('RTCPeerConnection' in window)) {
      setStatus('error');
      setError('This browser does not support WebRTC pairing.');
      return;
    }

    teardownConnection();
    setRole('display');
    setStatus('creating-display-code');
    setDisplayCode('');
    setControllerCode('');
    setRemoteResponseCodeInput('');
    setVerificationNumber('');
    setError(null);

    try {
      const peerConnection = new RTCPeerConnection(RTC_CONFIG);
      const dataChannel = peerConnection.createDataChannel('retro-flip-flaps');

      peerConnectionRef.current = peerConnection;
      wirePeerConnection(peerConnection, 'display');
      attachDataChannel(dataChannel, 'display');

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      await waitForIceGatheringComplete(peerConnection);

      if (!peerConnection.localDescription) {
        throw new Error('Missing offer');
      }

      const signalCode = encodeSignal(peerConnection.localDescription);
      setDisplayCode(signalCode);
      setVerificationNumber(createVerificationNumber(signalCode));
      setStatus('display-code-ready');
    } catch {
      setStatus('error');
      setError('Could not create a display pairing code in this browser.');
      teardownConnection();
    }
  }

  async function createControllerCode() {
    if (typeof window === 'undefined' || !('RTCPeerConnection' in window)) {
      setStatus('error');
      setError('This browser does not support WebRTC pairing.');
      return;
    }

    const normalizedOfferCode = remoteDisplayCodeInput.trim();

    if (!normalizedOfferCode) {
      setStatus('error');
      setError('Paste a display code before creating a response code.');
      return;
    }

    teardownConnection();
    setRole('controller');
    setStatus('creating-response-code');
    setControllerCode('');
    setDisplayCode('');
    setRemoteResponseCodeInput('');
    setVerificationNumber(createVerificationNumber(normalizedOfferCode));
    setError(null);

    try {
      const offer = decodeSignal(normalizedOfferCode);
      const peerConnection = new RTCPeerConnection(RTC_CONFIG);

      peerConnectionRef.current = peerConnection;
      wirePeerConnection(peerConnection, 'controller');

      await peerConnection.setRemoteDescription(offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      await waitForIceGatheringComplete(peerConnection);

      if (!peerConnection.localDescription) {
        throw new Error('Missing answer');
      }

      setControllerCode(encodeSignal(peerConnection.localDescription));
      setStatus('response-code-ready');
    } catch {
      setStatus('error');
      setError('The display code is invalid or could not be used to create a response.');
      teardownConnection();
    }
  }

  async function completeDisplayPairing() {
    const normalizedAnswerCode = remoteResponseCodeInput.trim();
    const peerConnection = peerConnectionRef.current;

    if (!peerConnection || roleRef.current !== 'display') {
      setStatus('error');
      setError('Create a display code before applying a response code.');
      return;
    }

    if (!normalizedAnswerCode) {
      setStatus('error');
      setError('Paste the response code from the controller device.');
      return;
    }

    try {
      const answer = decodeSignal(normalizedAnswerCode);
      await peerConnection.setRemoteDescription(answer);
      setStatus('connecting');
      setError(null);
    } catch {
      setStatus('error');
      setError('The response code is invalid. Generate a fresh pairing sequence and try again.');
    }
  }

  function sendControlState(snapshot: PairingSnapshot) {
    if (roleRef.current !== 'controller') {
      return;
    }

    const dataChannel = dataChannelRef.current;

    if (!dataChannel || dataChannel.readyState !== 'open') {
      return;
    }

    const payload: PairingSignal = {
      type: 'sync',
      message: snapshot.message,
      speed: snapshot.speed,
    };

    dataChannel.send(JSON.stringify(payload));
  }

  return {
    role,
    status,
    statusLabel: getStatusLabel(status, role),
    verificationNumber,
    displayCode,
    controllerCode,
    remoteDisplayCodeInput,
    remoteResponseCodeInput,
    error,
    isConnected,
    canSend: role === 'controller' && isConnected,
    setRemoteDisplayCodeInput,
    setRemoteResponseCodeInput,
    createDisplayCode,
    createControllerCode,
    completeDisplayPairing,
    resetPairing,
    sendControlState,
  };
}
