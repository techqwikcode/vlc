import { useMemo } from "react";
import { getActiveCues, type SubtitleCue } from "@/lib/srt-parser";

interface SubtitleOverlayProps {
  cues: SubtitleCue[];
  currentTime: number;
}

export function SubtitleOverlay({ cues, currentTime }: SubtitleOverlayProps) {
  const active = useMemo(() => getActiveCues(cues, currentTime), [cues, currentTime]);

  if (active.length === 0) return null;

  return (
    <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none px-8">
      <div className="bg-background/80 backdrop-blur-sm text-foreground px-4 py-2 rounded-md text-center max-w-[80%]">
        {active.map((cue) => (
          <p key={cue.id} className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-line">
            {cue.text}
          </p>
        ))}
      </div>
    </div>
  );
}
