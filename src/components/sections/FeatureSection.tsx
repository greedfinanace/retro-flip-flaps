import { motion } from 'framer-motion';
import { Bolt, MonitorSmartphone, Workflow } from 'lucide-react';

const features = [
  {
    title: 'Physical motion without hardware',
    body: 'Rendered flaps, believable depth, and shuffle timing that feels built from stamped metal instead of SVG shortcuts.',
    icon: MonitorSmartphone,
  },
  {
    title: 'Broadcast-grade timing control',
    body: 'Queue quotes, sync launches, and drive venue-wide messaging from a single lightweight dashboard.',
    icon: Workflow,
  },
  {
    title: 'Audio tuned for dense boards',
    body: 'A Web Audio engine handles hundreds of concurrent clacks without the overlap and latency issues of DOM audio tags.',
    icon: Bolt,
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65 }}
        className="max-w-2xl"
      >
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-foreground/45">Features</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
          A software chassis for a very analog feeling.
        </h2>
      </motion.div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {features.map(({ title, body, icon: Icon }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            className="rounded-[1.75rem] border border-border/60 bg-surface/80 p-7 shadow-[0_20px_50px_rgba(15,15,15,0.05)] backdrop-blur-sm transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5">
              <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-foreground">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-foreground/60">{body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
