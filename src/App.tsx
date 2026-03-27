import { useMemo, useEffect, useState } from 'react';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { audioController } from './lib/AudioController';
import { CUSTOM_MESSAGE_CHAR_LIMIT, QUOTES, createCustomQuoteSpec } from './utils/flap';

type ThemeMode = 'light' | 'dark';

const SPEED_MIN = 0.7;
const SPEED_MAX = 1.6;
const SPEED_STORAGE_KEY = 'retro-flip-flaps-speed';
const THEME_STORAGE_KEY = 'retro-flip-flaps-theme';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readInitialSpeed(): number {
  if (typeof window === 'undefined') {
    return 1;
  }

  const stored = Number(window.localStorage.getItem(SPEED_STORAGE_KEY));
  if (Number.isFinite(stored)) {
    return clamp(stored, SPEED_MIN, SPEED_MAX);
  }

  return 1;
}

export default function App() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);
  const [tileSpeed, setTileSpeed] = useState(readInitialSpeed);
  const [customMessageDraft, setCustomMessageDraft] = useState('');
  const [activeCustomMessage, setActiveCustomMessage] = useState('');

  const currentQuote = useMemo(
    () => (activeCustomMessage ? createCustomQuoteSpec(activeCustomMessage) : QUOTES[quoteIndex]),
    [activeCustomMessage, quoteIndex],
  );

  useEffect(() => {
    if (activeCustomMessage) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % QUOTES.length);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [activeCustomMessage]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(SPEED_STORAGE_KEY, String(tileSpeed));
  }, [tileSpeed]);

  useEffect(() => {
    void audioController.init();

    const resumeAudio = () => {
      void audioController.resume();
    };

    window.addEventListener('pointerdown', resumeAudio, { once: true });
    window.addEventListener('keydown', resumeAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    };
  }, []);

  const handleCustomMessageSubmit = () => {
    const normalized = customMessageDraft.replace(/\s+/g, ' ').trim();

    if (!normalized) {
      return;
    }

    setActiveCustomMessage(normalized.slice(0, CUSTOM_MESSAGE_CHAR_LIMIT));
    void audioController.resume();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <main className="relative">
        <Hero
          currentQuote={currentQuote}
          tileSpeed={tileSpeed}
          customMessage={customMessageDraft}
          customMessageLimit={CUSTOM_MESSAGE_CHAR_LIMIT}
          customMessageActive={Boolean(activeCustomMessage)}
          onTileSpeedChange={(value) => setTileSpeed(clamp(value, SPEED_MIN, SPEED_MAX))}
          onCustomMessageChange={(value) => setCustomMessageDraft(value.slice(0, CUSTOM_MESSAGE_CHAR_LIMIT))}
          onCustomMessageSubmit={handleCustomMessageSubmit}
          onClearCustomMessage={() => {
            setActiveCustomMessage('');
            setCustomMessageDraft('');
          }}
        />
      </main>
    </div>
  );
}
