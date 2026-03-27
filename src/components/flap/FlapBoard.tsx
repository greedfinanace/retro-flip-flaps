import { motion } from 'framer-motion';
import { type QuoteSpec } from '../../utils/flap';
import { useFlapLogic } from '../../hooks/useFlapLogic';
import { Flap } from './Flap';

type FlapBoardProps = {
  quote: QuoteSpec;
  motionSpeed: number;
};

export function FlapBoard({ quote, motionSpeed }: FlapBoardProps) {
  const flapStates = useFlapLogic(quote, motionSpeed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[min(100%,84rem)]"
    >
      <div className="absolute inset-x-[12%] top-0 h-12 rounded-full bg-foreground/5 blur-3xl" />
      <div
        role="img"
        aria-label={`Split flap display showing: ${quote.label}`}
        className="relative overflow-hidden rounded-[1.2rem] border-[3px] border-black/45 bg-[#151515] p-3 shadow-[0_28px_70px_rgba(0,0,0,0.18)] sm:p-4"
      >
        <div className="pointer-events-none absolute inset-[0.65rem] rounded-[0.8rem] border border-white/4" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.24))]" />
        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-8 bg-black/25 blur-2xl" />

        <div
          className="relative grid grid-cols-[repeat(22,minmax(0,1fr))] grid-rows-4 gap-[0.14rem] sm:gap-[0.18rem] [--flap-font:clamp(0.82rem,2vw,2.75rem)] [--flap-height:clamp(1.38rem,4.9vw,5.45rem)] [--flap-width:clamp(0.78rem,2.75vw,3.05rem)]"
          style={{ justifyItems: 'center' }}
        >
          {flapStates.map((flap, index) => (
            <Flap
              key={index}
              displayToken={flap.displayToken}
              isShuffling={flap.isShuffling}
              audioIntensity={flap.audioIntensity}
              motionSpeed={motionSpeed}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
