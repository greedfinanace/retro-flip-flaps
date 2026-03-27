import { motion } from 'framer-motion';
import { Github, MoonStar, SunMedium } from 'lucide-react';

type NavbarProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

const githubProfileHref = 'https://github.com/greedfinanace?tab=repositories';

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const isDark = theme === 'dark';

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-surface/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#top" className="font-sans text-lg font-bold tracking-tight text-foreground">
          retro flip flaps
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            ['Board', '#board'],
            ['Customize', '#customize'],
            ['Support', '#support'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border/70 bg-surface/80 text-foreground/70 transition-all hover:-translate-y-0.5 hover:text-foreground"
          >
            {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>

          <a
            href={githubProfileHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
          >
            <Github className="h-4 w-4" />
            View GitHub
          </a>
        </div>
      </div>
    </motion.header>
  );
}
