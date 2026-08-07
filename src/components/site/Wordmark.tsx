export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-display text-2xl leading-none tracking-tight">
        Spin <span className="text-brass">&amp;</span> Dry
      </span>
      {!compact && (
        <span className="eyebrow hidden text-muted-foreground sm:inline">Fabric Care</span>
      )}
    </span>
  );
}