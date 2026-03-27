import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BOARD_SIZE,
  EMPTY_TOKEN,
  formatQuoteForBoard,
  pickRandomShuffleToken,
  randomBetween,
  type DisplayToken,
  type QuoteSpec,
} from '../utils/flap';

export type FlapState = {
  displayToken: DisplayToken;
  isShuffling: boolean;
  audioIntensity: number;
};

const SPEED_MIN = 0.7;
const SPEED_MAX = 1.6;

function createInitialBoard(): FlapState[] {
  return Array.from({ length: BOARD_SIZE }, () => ({
    displayToken: EMPTY_TOKEN,
    isShuffling: false,
    audioIntensity: 0,
  }));
}

function clampSpeed(value: number): number {
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, value));
}

export function useFlapLogic(targetQuote: QuoteSpec, motionSpeed: number): FlapState[] {
  const normalizedSpeed = clampSpeed(motionSpeed);
  const targetTokens = useMemo(() => formatQuoteForBoard(targetQuote), [targetQuote]);
  const [flapStates, setFlapStates] = useState<FlapState[]>(() => createInitialBoard());
  const tokenRef = useRef<DisplayToken[]>(Array.from({ length: BOARD_SIZE }, () => EMPTY_TOKEN));
  const shuffleRef = useRef<boolean[]>(Array.from({ length: BOARD_SIZE }, () => false));
  const audioRef = useRef<number[]>(Array.from({ length: BOARD_SIZE }, () => 0));
  const timersRef = useRef<Set<number>>(new Set());
  const generationRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(() => {
      timersRef.current.delete(timerId);
      callback();
    }, delay);

    timersRef.current.add(timerId);
  }, []);

  const updateCell = useCallback(
    (index: number, displayToken: DisplayToken, isShuffling: boolean, audioIntensity: number) => {
      const nextAudioIntensity = Math.max(0, Math.min(1, audioIntensity));

      if (
        tokenRef.current[index] === displayToken &&
        shuffleRef.current[index] === isShuffling &&
        Math.abs(audioRef.current[index] - nextAudioIntensity) < 0.01
      ) {
        return;
      }

      tokenRef.current[index] = displayToken;
      shuffleRef.current[index] = isShuffling;
      audioRef.current[index] = nextAudioIntensity;

      setFlapStates((previous) => {
        const current = previous[index];

        if (
          current.displayToken === displayToken &&
          current.isShuffling === isShuffling &&
          Math.abs(current.audioIntensity - nextAudioIntensity) < 0.01
        ) {
          return previous;
        }

        const next = [...previous];
        next[index] = { displayToken, isShuffling, audioIntensity: nextAudioIntensity };
        return next;
      });
    },
    [],
  );

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    clearTimers();
    const generation = generationRef.current + 1;
    generationRef.current = generation;

    targetTokens.forEach((targetToken, index) => {
      const currentToken = tokenRef.current[index];

      if (currentToken === targetToken) {
        updateCell(index, currentToken, false, 0);
        return;
      }

      const shuffleWindow = randomBetween(900, 2200) / normalizedSpeed;
      const shuffleStop = performance.now() + shuffleWindow;
      const startDelay = randomBetween(0, 220) / normalizedSpeed;

      const tick = () => {
        if (generationRef.current !== generation) {
          return;
        }

        const now = performance.now();
        const liveToken = tokenRef.current[index];
        const completed = now >= shuffleStop;
        const remainingFraction = completed
          ? 0
          : Math.max(0, Math.min(1, (shuffleStop - now) / shuffleWindow));
        const nextToken = completed
          ? targetToken
          : pickRandomShuffleToken([liveToken, targetToken], targetQuote.shuffleBlocks);
        const audioIntensity = completed
          ? 0.14
          : Math.max(0.22, Math.pow(remainingFraction, 0.85));

        updateCell(index, nextToken, !completed, audioIntensity);

        if (!completed) {
          schedule(tick, randomBetween(95, 155) / normalizedSpeed);
        }
      };

      schedule(() => {
        if (generationRef.current !== generation) {
          return;
        }

        updateCell(index, tokenRef.current[index], true, 1);
        tick();
      }, startDelay);
    });

    return clearTimers;
  }, [clearTimers, normalizedSpeed, schedule, targetQuote.shuffleBlocks, targetTokens, updateCell]);

  return flapStates;
}
