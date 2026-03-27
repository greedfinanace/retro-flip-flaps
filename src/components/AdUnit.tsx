type AdUnitProps = {
  unitId?: string;
  className?: string;
};

export function AdUnit({ unitId = '2432002', className = '' }: AdUnitProps) {
  return (
    <section
      aria-label="Sponsored content"
      className={`w-full rounded-[1.25rem] border border-border/60 bg-surface/80 p-4 shadow-[0_18px_48px_rgba(15,15,15,0.05)] ${className}`}
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.24em] text-foreground/45">
          Advertisement
        </p>
        <div className="overflow-hidden rounded-[1rem] border border-border bg-background p-3">
          <iframe
            data-aa={unitId}
            src={`//acceptable.a-ads.com/${unitId}/?size=Adaptive`}
            title="Advertisement"
            loading="lazy"
            className="mx-auto block w-full border-0"
            style={{
              minHeight: '120px',
            }}
          />
        </div>
      </div>
    </section>
  );
}
