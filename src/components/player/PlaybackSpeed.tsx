import { useState, useRef, useEffect } from "react";

const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface PlaybackSpeedProps {
  rate: number;
  onChange: (rate: number) => void;
}

export function PlaybackSpeed({ rate, onChange }: PlaybackSpeedProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="player-control-btn text-xs font-mono font-semibold min-w-[40px]"
      >
        {rate}x
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-popover border border-border rounded-lg shadow-xl py-1 min-w-[80px] z-50">
          {RATES.map((r) => (
            <button
              key={r}
              onClick={() => {
                onChange(r);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-secondary transition-colors ${
                r === rate ? "text-primary font-semibold" : "text-foreground/70"
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
