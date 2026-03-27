import { memo, useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { audioController } from '../../lib/AudioController';
import { COLOR_BLOCKS, isColorBlock, type DisplayToken } from '../../utils/flap';

type Half = 'top' | 'bottom';

type FlapProps = {
  displayToken: DisplayToken;
  isShuffling: boolean;
  audioIntensity: number;
  motionSpeed: number;
};

function FlapFace({
  token,
  half,
  className,
}: {
  token: DisplayToken;
  half: Half;
  className: string;
}) {
  const blockColor = isColorBlock(token) ? COLOR_BLOCKS[token] : null;
  const topHalf = half === 'top';

  return (
    <div
      className={`absolute inset-0 overflow-hidden border border-black/65 bg-flap-bg ${className}`}
      style={
        blockColor
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.18)), linear-gradient(180deg, ${blockColor}, ${blockColor})`,
            }
          : undefined
      }
    >
      <div className="absolute inset-x-[10%] top-0 h-px bg-white/6" />
      <div className="absolute inset-y-0 left-0 w-px bg-white/4" />
      <div className="absolute inset-y-0 right-0 w-px bg-black/55" />

      {!blockColor ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.16))]" />
          <div className="absolute inset-x-[10%] bottom-[0.22rem] h-[18%] bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,rgba(0,0,0,0.28)_1px,rgba(0,0,0,0.28)_3px)] opacity-80" />
          <span
            className={`flap-glyph absolute left-1/2 -translate-x-1/2 text-[length:var(--flap-font)] text-flap-text ${
              topHalf ? 'bottom-[4%] translate-y-1/2' : 'top-[4%] -translate-y-1/2'
            }`}
            style={{
              fontFamily: 'var(--font-flap)',
              fontWeight: 300,
              letterSpacing: '0.01em',
              textShadow: '0 0 1px rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.55)',
            }}
          >
            {token}
          </span>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(255,255,255,0)_45%)]" />
          <div className="absolute inset-x-[10%] bottom-[0.22rem] h-[18%] bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,rgba(0,0,0,0.15)_1px,rgba(0,0,0,0.15)_3px)] opacity-70" />
        </>
      )}
    </div>
  );
}

function FlapComponent({ displayToken, isShuffling, audioIntensity, motionSpeed }: FlapProps) {
  const controls = useAnimation();
  const queueRef = useRef<DisplayToken[]>([]);
  const currentTokenRef = useRef(displayToken);
  const audioTriggeredRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const flipIntensityRef = useRef(audioIntensity);

  const [settledToken, setSettledToken] = useState(displayToken);
  const [frontToken, setFrontToken] = useState(displayToken);
  const [backToken, setBackToken] = useState(displayToken);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    queueRef.current.push(displayToken);

    const runQueue = async () => {
      if (isAnimatingRef.current) {
        return;
      }

      isAnimatingRef.current = true;

      while (queueRef.current.length) {
        const nextToken = queueRef.current.shift();

        if (!nextToken || nextToken === currentTokenRef.current) {
          continue;
        }

        const flipDurationMs = Math.max(80, Math.min(240, 150 / motionSpeed));

        flipIntensityRef.current = audioIntensity;
        setFrontToken(currentTokenRef.current);
        setBackToken(nextToken);
        setIsFlipping(true);
        audioTriggeredRef.current = false;
        controls.set({ rotateX: 0 });

        await controls.start({
          rotateX: -180,
          transition: {
            ease: 'linear',
            duration: flipDurationMs / 1000,
          },
        });

        currentTokenRef.current = nextToken;
        setSettledToken(nextToken);
        setFrontToken(nextToken);
        setBackToken(nextToken);
        setIsFlipping(false);
        controls.set({ rotateX: 0 });
      }

      isAnimatingRef.current = false;
    };

    void runQueue();
  }, [audioIntensity, controls, displayToken, motionSpeed]);

  const topStaticToken = settledToken;
  const bottomStaticToken = isFlipping ? backToken : settledToken;

  return (
    <div aria-hidden="true" className="relative h-[var(--flap-height)] w-[var(--flap-width)] perspective-1000">
      <div
        className={`absolute inset-0 rounded-[0.42rem] border border-black/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(0,0,0,0.08))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_1px_2px_rgba(0,0,0,0.28)] ${
          isShuffling ? 'brightness-[1.03]' : ''
        }`}
      />

      <div className="absolute left-0 top-0 h-1/2 w-full overflow-hidden">
        <FlapFace token={topStaticToken} half="top" className="rounded-t-[0.35rem]" />
      </div>

      <div className="absolute bottom-0 left-0 h-1/2 w-full overflow-hidden">
        <FlapFace token={bottomStaticToken} half="bottom" className="rounded-b-[0.35rem]" />
      </div>

      <motion.div
        className="absolute left-0 top-0 h-1/2 w-full origin-bottom transform-style-3d will-change-transform"
        animate={controls}
        style={{ rotateX: 0 }}
        onUpdate={(latest) => {
          const rotation = typeof latest.rotateX === 'number' ? latest.rotateX : Number(latest.rotateX);

          if (!audioTriggeredRef.current && Number.isFinite(rotation) && rotation <= -90) {
            audioController.playClack(flipIntensityRef.current);
            audioTriggeredRef.current = true;
          }
        }}
      >
        <FlapFace
          token={frontToken}
          half="top"
          className="backface-hidden rounded-t-[0.35rem] will-change-transform"
        />
        <FlapFace
          token={backToken}
          half="bottom"
          className="backface-hidden rotateX-180 rounded-b-[0.35rem] will-change-transform"
        />
      </motion.div>

      <div className="pointer-events-none absolute left-[8%] top-1/2 z-10 h-px w-[84%] -translate-y-1/2 bg-black/70 shadow-[0_1px_0_rgba(255,255,255,0.04)]" />
    </div>
  );
}

export const Flap = memo(
  FlapComponent,
  (previousProps, nextProps) =>
    previousProps.displayToken === nextProps.displayToken &&
    previousProps.isShuffling === nextProps.isShuffling &&
    Math.abs(previousProps.audioIntensity - nextProps.audioIntensity) < 0.01 &&
    previousProps.motionSpeed === nextProps.motionSpeed,
);
