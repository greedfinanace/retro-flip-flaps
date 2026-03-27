import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Link2,
  Linkedin,
  MonitorSmartphone,
  Smartphone,
  Wallet,
} from 'lucide-react';
import type { PairingViewModel } from '../hooks/usePairing';
import { type QuoteSpec } from '../utils/flap';
import { FlapBoard } from './flap/FlapBoard';

type HeroProps = {
  currentQuote: QuoteSpec;
  tileSpeed: number;
  customMessage: string;
  customMessageLimit: number;
  customMessageActive: boolean;
  pairing: PairingViewModel;
  onTileSpeedChange: (value: number) => void;
  onCustomMessageChange: (value: string) => void;
  onCustomMessageSubmit: () => void;
  onClearCustomMessage: () => void;
};

const githubRepoHref = 'https://github.com/greedfinanace/retro-flip-flaps';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/greedfinanace',
    icon: Github,
  },
  {
    label: 'X',
    href: 'https://x.com/greedinfinance',
    icon: null,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/rasheen-ak-b60174212/',
    icon: Linkedin,
  },
] as const;

const tipWallets = [
  {
    label: 'BTC',
    address: 'bc1qs9fg7vksuy9h29edd9nkqu9ezfng3n4lgus24n',
  },
  {
    label: 'ETH',
    address: '0xAd918BF8600DF293a2c9cF237CE3A05135f5AE5D',
  },
  {
    label: 'SOL',
    address: '4J3sFMoZnGVUaBDfJTJRBPavbY6e5XbkLithwUnPfMhc',
  },
  {
    label: 'XRP',
    address: 'rWiWEQ5b4Pd4bAUFZWYgp14rv6ava1nP9',
  },
  {
    label: 'TRON',
    address: 'TD3YH97hUW4DreedsKJTfByaWEyzMRGaX7',
  },
] as const;

function formatSpeedLabel(value: number): string {
  return `${value.toFixed(2)}x`;
}

function getPairRoleLabel(role: PairingViewModel['role']): string {
  switch (role) {
    case 'display':
      return 'Display device';
    case 'controller':
      return 'Controller device';
    default:
      return 'No active role';
  }
}

export function Hero({
  currentQuote,
  tileSpeed,
  customMessage,
  customMessageLimit,
  customMessageActive,
  pairing,
  onTileSpeedChange,
  onCustomMessageChange,
  onCustomMessageSubmit,
  onClearCustomMessage,
}: HeroProps) {
  const trimmedMessage = customMessage.trim();
  const [isTipPanelOpen, setIsTipPanelOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const pairingBusy =
    pairing.status === 'creating-display-code' ||
    pairing.status === 'creating-response-code' ||
    pairing.status === 'connecting';

  async function handleCopy(key: string, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1800);
    } catch {
      setCopiedKey(null);
    }
  }

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16">
      <div className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-foreground/5 blur-3xl" />
      <div className="mx-auto flex max-w-7xl flex-col items-center px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <p className="mb-6 inline-flex items-center rounded-full border border-border/60 bg-surface/85 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-foreground/60 shadow-[0_12px_32px_rgba(15,15,15,0.06)]">
            retro flip flaps
          </p>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-foreground">
            Mechanical split-flap motion, rebuilt for the web.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/60">
            Open-source board simulator with custom messages, adjustable timing, synchronized click
            audio, and manual device pairing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 w-full max-w-3xl rounded-[1.5rem] border border-border/60 bg-surface/88 p-5 text-left shadow-[0_22px_60px_rgba(15,15,15,0.06)] backdrop-blur-sm"
        >
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-foreground/45">
            Source
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/70">
            This build lives in the public repo, with the split-flap renderer, audio engine, and
            the pairing flow all in the same codebase.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={githubRepoHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              <Github className="h-4 w-4" />
              View Repo
            </a>
            <a
              href="#customize"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
            >
              Try the board
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        <div
          id="customize"
          className="mt-6 grid w-full max-w-5xl gap-4 rounded-[1.5rem] border border-border/60 bg-surface/85 p-4 text-left shadow-[0_22px_60px_rgba(15,15,15,0.06)] backdrop-blur-sm lg:grid-cols-[minmax(0,1fr)_18rem]"
        >
          <div className="rounded-[1.2rem] border border-border/60 bg-surface p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-foreground/45">
                  Board Message
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  Type your own split-flap phrase
                </p>
              </div>
              <div className="text-sm font-medium text-foreground/55">
                {customMessage.length}/{customMessageLimit}
              </div>
            </div>

            <textarea
              value={customMessage}
              onChange={(event) => onCustomMessageChange(event.target.value)}
              maxLength={customMessageLimit}
              rows={4}
              placeholder="Type your own message here and push it to the board."
              className="mt-4 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-foreground/35 focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onCustomMessageSubmit}
                disabled={!trimmedMessage}
                className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Show On Board
              </button>
              <button
                type="button"
                onClick={onClearCustomMessage}
                className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                Reset Demo
              </button>
            </div>

            <p className="mt-3 text-xs text-foreground/45">
              Hard limit: {customMessageLimit} characters. The message wraps across 3 board rows.
            </p>
            {customMessageActive ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground/55">
                Custom message is live on the board
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.2rem] border border-border/60 bg-surface p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-foreground/45">
                    Customization
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">Tile speed</p>
                </div>
                <div className="text-sm font-medium text-foreground/60">{formatSpeedLabel(tileSpeed)}</div>
              </div>

              <input
                type="range"
                min="0.70"
                max="1.60"
                step="0.05"
                value={tileSpeed}
                onChange={(event) => onTileSpeedChange(Number(event.target.value))}
                className="mt-4 w-full accent-foreground"
                aria-label="Tile speed"
              />

              <div className="mt-2 flex items-center justify-between text-xs text-foreground/45">
                <span>Slower shuffle</span>
                <span>Faster shuffle</span>
              </div>
            </div>

            <div id="support" className="rounded-[1.2rem] border border-border/60 bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-foreground/45">
                Support & Links
              </p>

              <button
                type="button"
                onClick={() => setIsTipPanelOpen((current) => !current)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
                aria-expanded={isTipPanelOpen}
                aria-controls="tip-wallets"
              >
                <Wallet className="h-4 w-4" />
                {isTipPanelOpen ? 'Hide Tip Wallets' : 'Tip With Crypto'}
              </button>

              {isTipPanelOpen ? (
                <div
                  id="tip-wallets"
                  className="mt-3 space-y-2 rounded-xl border border-border bg-background/70 p-3"
                >
                  {tipWallets.map(({ label, address }) => {
                    const copyKey = `${label}-wallet`;
                    const isCopied = copiedKey === copyKey;

                    return (
                      <div
                        key={label}
                        className="rounded-lg border border-border/80 bg-surface px-3 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45">
                            {label}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleCopy(copyKey, address)}
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {isCopied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="mt-2 break-all font-mono text-[0.72rem] leading-5 text-foreground/72">
                          {address}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-3 grid gap-2">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      {Icon ? (
                        <Icon className="h-4 w-4" />
                      ) : (
                        <span className="inline-flex h-4 w-4 items-center justify-center text-[0.72rem] font-semibold">
                          X
                        </span>
                      )}
                      {label}
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          id="pairing"
          className="mt-4 w-full max-w-5xl rounded-[1.5rem] border border-border/60 bg-surface/88 p-4 text-left shadow-[0_22px_60px_rgba(15,15,15,0.06)] backdrop-blur-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-foreground/45">
                Pairing
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Pair a phone or laptop to drive the board remotely.
              </h2>
              <p className="mt-3 text-sm leading-7 text-foreground/65">
                No backend required. Generate a display code on one device, paste it into the
                controller device, then paste the response code back to finish the connection.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/45">
                Session
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{pairing.statusLabel}</p>
              <p className="mt-1 text-xs text-foreground/55">{getPairRoleLabel(pairing.role)}</p>
              {pairing.verificationNumber ? (
                <p className="mt-3 font-mono text-sm font-medium text-foreground/70">
                  Pair number {pairing.verificationNumber}
                </p>
              ) : null}
              {pairing.isConnected ? (
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/55">
                  Link is live
                </p>
              ) : null}
            </div>
          </div>

          {pairing.error ? (
            <div className="mt-4 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground/72">
              {pairing.error}
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.2rem] border border-border/60 bg-surface p-4">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-foreground/70" />
                <p className="text-sm font-medium text-foreground">Display device</p>
              </div>
              <p className="mt-2 text-sm leading-7 text-foreground/60">
                Use this on the board screen. Generate a display code, send it to the controller
                device, then paste the response code back here.
              </p>

              <button
                type="button"
                onClick={() => void pairing.createDisplayCode()}
                disabled={pairingBusy}
                className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Display Code
              </button>

              <textarea
                readOnly
                value={pairing.displayCode}
                rows={7}
                placeholder="Your display code will appear here."
                className="mt-4 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs leading-5 text-foreground outline-none placeholder:text-foreground/30"
              />

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopy('display-code', pairing.displayCode)}
                  disabled={!pairing.displayCode}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground/70 transition-colors enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copiedKey === 'display-code' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedKey === 'display-code' ? 'Copied' : 'Copy display code'}
                </button>
              </div>

              <textarea
                value={pairing.remoteResponseCodeInput}
                onChange={(event) => pairing.setRemoteResponseCodeInput(event.target.value)}
                rows={6}
                placeholder="Paste the response code from the controller device."
                className="mt-4 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs leading-5 text-foreground outline-none transition-shadow placeholder:text-foreground/30 focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5"
              />

              <button
                type="button"
                onClick={() => void pairing.completeDisplayPairing()}
                disabled={!pairing.remoteResponseCodeInput.trim() || pairingBusy}
                className="mt-3 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground/75 transition-colors enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Complete Pairing
              </button>
            </div>

            <div className="rounded-[1.2rem] border border-border/60 bg-surface p-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-foreground/70" />
                <p className="text-sm font-medium text-foreground">Controller device</p>
              </div>
              <p className="mt-2 text-sm leading-7 text-foreground/60">
                Open the same site on your phone or second computer, paste the display code here,
                then generate the response code and send it back to the display.
              </p>

              <textarea
                value={pairing.remoteDisplayCodeInput}
                onChange={(event) => pairing.setRemoteDisplayCodeInput(event.target.value)}
                rows={7}
                placeholder="Paste the display code here."
                className="mt-4 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs leading-5 text-foreground outline-none transition-shadow placeholder:text-foreground/30 focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5"
              />

              <button
                type="button"
                onClick={() => void pairing.createControllerCode()}
                disabled={!pairing.remoteDisplayCodeInput.trim() || pairingBusy}
                className="mt-3 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Response Code
              </button>

              <textarea
                readOnly
                value={pairing.controllerCode}
                rows={6}
                placeholder="Your response code will appear here."
                className="mt-4 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs leading-5 text-foreground outline-none placeholder:text-foreground/30"
              />

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopy('controller-code', pairing.controllerCode)}
                  disabled={!pairing.controllerCode}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground/70 transition-colors enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copiedKey === 'controller-code' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedKey === 'controller-code' ? 'Copied' : 'Copy response code'}
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground/65">
                When the controller connects, this device sends live board message and tile speed
                updates to the paired display.
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={pairing.resetPairing}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Reset Pairing
            </button>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">
              <Link2 className="h-3.5 w-3.5" />
              Manual code exchange between devices
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-foreground/45">
          Open browser experiment with 3D flap motion, synced click audio, custom text control,
          and optional cross-device pairing.
        </p>

        <div id="board" className="mt-14 w-full">
          <FlapBoard quote={currentQuote} motionSpeed={tileSpeed} />
        </div>
      </div>
    </section>
  );
}
