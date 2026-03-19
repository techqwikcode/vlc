import { useRef, useCallback } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, isMuted, onVolumeChange, onToggleMute }: VolumeControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onVolumeChange(ratio);
    },
    [onVolumeChange]
  );

  const displayVolume = isMuted ? 0 : volume;
  const Icon = displayVolume === 0 ? VolumeX : displayVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-2">
      <button onClick={onToggleMute} className="player-control-btn">
        <Icon size={18} />
      </button>
      <div
        ref={trackRef}
        className="volume-track w-20 relative group cursor-pointer"
        onClick={handleClick}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${displayVolume * 100}%` }}
        />
      </div>
    </div>
  );
}
