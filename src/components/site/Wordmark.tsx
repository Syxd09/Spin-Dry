export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <img
        src="public/logo.png"
        alt="Spin & Dry Logo"
        className={compact ? "size-7 rounded-full object-cover border border-brass/50 shadow-xs" : "size-10 rounded-full object-cover border-2 border-brass/60 shadow-md"}
      />
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-2xl leading-none tracking-tight text-foreground font-bold">
          Spin <span className="text-brass">&amp;</span> Dry
        </span>
        {!compact && (
          <span className="eyebrow hidden text-muted-foreground sm:inline font-semibold tracking-widest text-[10px]">Fabric Care</span>
        )}
      </span>
    </span>
  );
}