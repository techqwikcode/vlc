import { useRef, useCallback, useState } from "react";
import { FolderOpen, ListMusic, Play } from "lucide-react";
import { useMediaPlayer } from "@/hooks/useMediaPlayer";
import { TransportControls } from "@/components/player/TransportControls";
import { PlaylistPanel } from "@/components/player/PlaylistPanel";
import { AudioVisualizer } from "@/components/player/AudioVisualizer";
import { SubtitleOverlay } from "@/components/player/SubtitleOverlay";

export default function MediaPlayerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const player = useMediaPlayer();

  const handleLoadSubtitle = useCallback(() => {
    subtitleInputRef.current?.click();
  }, []);

  const handleSubtitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) player.loadSubtitleFile(e.target.files[0]);
      e.target.value = "";
    },
    [player]
  );

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) player.addFiles(e.target.files);
      e.target.value = "";
    },
    [player]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        player.addFiles(e.dataTransfer.files);
      }
    },
    [player]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-background select-none"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Top menu bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-player-controls border-b border-border text-sm">
        <button onClick={handleOpenFile} className="player-control-btn flex items-center gap-1.5 text-sm px-3 py-1">
          <FolderOpen size={14} />
          Open
        </button>
        <button
          onClick={() => setShowPlaylist((v) => !v)}
          className={`player-control-btn flex items-center gap-1.5 text-sm px-3 py-1 ${showPlaylist ? "player-control-btn-active" : ""}`}
        >
          <ListMusic size={14} />
          Playlist
        </button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[300px]">
          {player.currentFile?.name || "No file loaded"}
        </span>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Video area */}
        <div
          className="flex-1 relative flex items-center justify-center bg-player-surface cursor-pointer"
          onClick={player.togglePlay}
          onDoubleClick={() => player.toggleFullscreen(containerRef)}
        >
          {player.currentFile ? (
            <>
              <video
                ref={player.mediaRef}
                className={`max-w-full max-h-full object-contain ${player.currentFile.type === "audio" ? "hidden" : ""}`}
                src={player.currentFile.url}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
              />
              {player.subtitlesEnabled && player.subtitleCues.length > 0 && (
                <SubtitleOverlay cues={player.subtitleCues} currentTime={player.currentTime} />
              )}
              {player.currentFile.type === "audio" && (
                <AudioVisualizer
                  mediaElement={player.mediaRef.current}
                  isPlaying={player.isPlaying}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Play size={40} className="text-primary ml-1" />
              </div>
              <p className="text-lg font-medium">Drop media files here</p>
              <p className="text-sm">or click <button onClick={(e) => { e.stopPropagation(); handleOpenFile(); }} className="text-primary hover:underline">Open</button> to browse</p>
            </div>
          )}

          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
              <p className="text-primary text-xl font-semibold">Drop to add</p>
            </div>
          )}

          {/* Click-to-play overlay on video */}
          {player.currentFile && !player.isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              onClick={player.togglePlay}
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                <Play size={30} className="text-primary ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Playlist sidebar */}
        {showPlaylist && (
          <PlaylistPanel
            playlist={player.playlist}
            currentIndex={player.currentIndex}
            onSelect={player.playIndex}
            onRemove={player.removeFromPlaylist}
            onClear={player.clearPlaylist}
            onClose={() => setShowPlaylist(false)}
          />
        )}
      </div>

      {/* Transport controls */}
      <TransportControls
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        buffered={player.buffered}
        volume={player.volume}
        isMuted={player.isMuted}
        playbackRate={player.playbackRate}
        isFullscreen={player.isFullscreen}
        isLooping={player.isLooping}
        isShuffle={player.isShuffle}
        onTogglePlay={player.togglePlay}
        onSeek={player.seek}
        onVolumeChange={player.setVolume}
        onToggleMute={player.toggleMute}
        onPlaybackRateChange={player.setPlaybackRate}
        onToggleFullscreen={() => player.toggleFullscreen(containerRef)}
        onToggleLoop={player.setIsLooping}
        onToggleShuffle={player.setIsShuffle}
        onTogglePiP={player.togglePiP}
        isPiP={player.isPiP}
        onPrev={player.playPrev}
        onNext={player.playNext}
        onSkipBackward={() => player.skipBackward()}
        onSkipForward={() => player.skipForward()}
        hasSubtitles={player.subtitleCues.length > 0}
        subtitlesEnabled={player.subtitlesEnabled}
        onToggleSubtitles={player.toggleSubtitles}
        onLoadSubtitle={handleLoadSubtitle}
      />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,audio/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={subtitleInputRef}
        type="file"
        accept=".srt"
        className="hidden"
        onChange={handleSubtitleChange}
      />
    </div>
  );
}
