import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  PictureInPicture2,
  Subtitles,
} from "lucide-react";
import { SeekBar } from "./SeekBar";
import { VolumeControl } from "./VolumeControl";
import { PlaybackSpeed } from "./PlaybackSpeed";

interface TransportControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  onTogglePiP: () => void;
  isPiP: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  hasSubtitles: boolean;
  subtitlesEnabled: boolean;
  onToggleSubtitles: () => void;
  onLoadSubtitle: () => void;
}

export function TransportControls({
  isPlaying,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  isLooping,
  isShuffle,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
  onToggleLoop,
  onToggleShuffle,
  onTogglePiP,
  isPiP,
  onPrev,
  onNext,
  onSkipBackward,
  onSkipForward,
  hasSubtitles,
  subtitlesEnabled,
  onToggleSubtitles,
  onLoadSubtitle,
}: TransportControlsProps) {
  return (
    <div className="bg-player-controls border-t border-border px-4 py-2 space-y-1">
      {/* Seek bar */}
      <SeekBar currentTime={currentTime} duration={duration} buffered={buffered} onSeek={onSeek} />

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Left: shuffle, repeat */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleShuffle}
            className={`player-control-btn ${isShuffle ? "player-control-btn-active" : ""}`}
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={onToggleLoop}
            className={`player-control-btn ${isLooping ? "player-control-btn-active" : ""}`}
          >
            <Repeat size={16} />
          </button>
        </div>

        {/* Center: transport */}
        <div className="flex items-center gap-1">
          <button onClick={onPrev} className="player-control-btn">
            <SkipBack size={18} />
          </button>
          <button onClick={onSkipBackward} className="player-control-btn">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onTogglePlay}
            className="player-control-btn bg-primary/10 hover:bg-primary/20 rounded-full p-3"
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
          </button>
          <button onClick={onSkipForward} className="player-control-btn">
            <ChevronRight size={18} />
          </button>
          <button onClick={onNext} className="player-control-btn">
            <SkipForward size={18} />
          </button>
        </div>

        {/* Right: volume, speed, fullscreen */}
        <div className="flex items-center gap-2">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />
          <PlaybackSpeed rate={playbackRate} onChange={onPlaybackRateChange} />
          <button
            onClick={hasSubtitles ? onToggleSubtitles : onLoadSubtitle}
            className={`player-control-btn ${hasSubtitles && subtitlesEnabled ? "player-control-btn-active" : ""}`}
            title={hasSubtitles ? "Toggle subtitles" : "Load .srt subtitle file"}
          >
            <Subtitles size={18} />
          </button>
          <button onClick={onTogglePiP} className={`player-control-btn ${isPiP ? "player-control-btn-active" : ""}`} title="Picture-in-Picture">
            <PictureInPicture2 size={18} />
          </button>
          <button onClick={onToggleFullscreen} className="player-control-btn">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
