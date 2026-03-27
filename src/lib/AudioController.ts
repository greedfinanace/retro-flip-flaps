type ClickSource = {
  buffer: AudioBuffer;
  cuePoints: number[];
  segmentDuration: number;
};

const AUDIO_FILES = [
  { url: '/audio/flip-click-v3.mp3', segmentDuration: 0.095 },
  { url: '/audio/flip-click-v2.mp3', segmentDuration: 0.09 },
  { url: '/clack.wav', segmentDuration: 0.07 },
] as const;

class AudioController {
  private static singleton: AudioController | null = null;
  private audioContext: AudioContext | null = null;
  private clickSources: ClickSource[] = [];
  private initPromise: Promise<void> | null = null;

  static getInstance(): AudioController {
    if (!AudioController.singleton) {
      AudioController.singleton = new AudioController();
    }

    return AudioController.singleton;
  }

  async init(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new window.AudioContext();
    }

    if (!this.initPromise) {
      this.initPromise = Promise.allSettled(
        AUDIO_FILES.map(async ({ url, segmentDuration }) => {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Failed to load audio file: ${url}`);
          }

          const data = await response.arrayBuffer();

          if (!this.audioContext) {
            throw new Error('Audio context unavailable');
          }

          const buffer = await this.audioContext.decodeAudioData(data);
          return {
            buffer,
            cuePoints: this.extractCuePoints(buffer),
            segmentDuration: Math.min(segmentDuration, buffer.duration),
          } satisfies ClickSource;
        }),
      ).then((results) => {
        this.clickSources = results.flatMap((result) =>
          result.status === 'fulfilled' ? [result.value] : [],
        );
      });
    }

    return this.initPromise;
  }

  async resume(): Promise<void> {
    if (!this.audioContext) {
      await this.init();
    }

    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  playClack(intensity = 1): void {
    if (!this.audioContext || !this.clickSources.length || this.audioContext.state !== 'running') {
      return;
    }

    const sourceData = this.clickSources[Math.floor(Math.random() * this.clickSources.length)];
    const cuePoint =
      sourceData.cuePoints[Math.floor(Math.random() * sourceData.cuePoints.length)] ?? 0;
    const segmentDuration = Math.max(
      0.04,
      Math.min(sourceData.segmentDuration, sourceData.buffer.duration - cuePoint),
    );
    const normalizedIntensity = Math.max(0.08, Math.min(1, intensity));
    const now = this.audioContext.currentTime;

    const source = this.audioContext.createBufferSource();
    source.buffer = sourceData.buffer;
    source.playbackRate.value = 0.98 + Math.random() * 0.05;

    const gainNode = this.audioContext.createGain();
    const peakGain = 0.01 + normalizedIntensity * 0.08;

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.0035);
    gainNode.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, peakGain * 0.58),
      now + segmentDuration * 0.42,
    );
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + segmentDuration);

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(now, cuePoint, segmentDuration);
    source.stop(now + segmentDuration + 0.01);
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
  }

  private extractCuePoints(buffer: AudioBuffer): number[] {
    const data = buffer.getChannelData(0);

    if (!data.length) {
      return [0];
    }

    const sampleRate = buffer.sampleRate;
    const hopSize = Math.max(32, Math.floor(sampleRate * 0.0045));
    const windowSize = Math.max(hopSize, Math.floor(sampleRate * 0.009));
    const envelope: number[] = [];

    for (let start = 0; start + windowSize < data.length; start += hopSize) {
      let sum = 0;

      for (let index = start; index < start + windowSize; index += 1) {
        sum += Math.abs(data[index]);
      }

      envelope.push(sum / windowSize);
    }

    if (!envelope.length) {
      return [0];
    }

    const sorted = [...envelope].sort((left, right) => left - right);
    const baseline = sorted[Math.floor(sorted.length * 0.65)] ?? 0.0005;
    const threshold = baseline * 3.2;
    const cuePoints: number[] = [];
    const minGap = Math.ceil(0.05 / (hopSize / sampleRate));
    let lastPeak = -minGap;

    for (let index = 1; index < envelope.length - 1; index += 1) {
      const level = envelope[index];

      if (level < threshold || level < envelope[index - 1] || level < envelope[index + 1]) {
        continue;
      }

      if (index - lastPeak < minGap) {
        continue;
      }

      cuePoints.push(Math.max(0, (index * hopSize) / sampleRate - 0.006));
      lastPeak = index;
    }

    return cuePoints.length ? cuePoints.slice(0, 24) : [0];
  }
}

export const audioController = AudioController.getInstance();
