import { useRef, useCallback } from "react";
import { formatTime } from "@/lib/media-utils";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
}

export function SeekBar({ currentTime, duration, buffered, onSeek }: SeekBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs font-mono text-muted-foreground min-w-[42px] text-right select-none">
        {formatTime(currentTime)}
      </span>
      <div
        ref={trackRef}
        className="seek-track flex-1 relative group"
        onClick={handleClick}
      >
        {/* Buffer */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-player-buffer"
          style={{ width: `${bufferProgress}%` }}
        />
        {/* Progress */}
        <div className="seek-progress relative" style={{ width: `${progress}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
        </div>
      </div>
      <span className="text-xs font-mono text-muted-foreground min-w-[42px] select-none">
        {formatTime(duration)}
      </span>
    </div>
  );
}
