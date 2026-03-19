import { useRef, useState, useCallback, useEffect } from "react";
import type { MediaFile } from "@/lib/media-utils";
import { parseSRT, type SubtitleCue } from "@/lib/srt-parser";

export function useMediaPlayer() {
  const mediaRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlist, setPlaylist] = useState<MediaFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [buffered, setBuffered] = useState(0);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);

  const currentFile = currentIndex >= 0 ? playlist[currentIndex] : null;

  const play = useCallback(() => {
    mediaRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    mediaRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    if (mediaRef.current) {
      mediaRef.current.volume = v;
      setVolumeState(v);
      if (v > 0) setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  const toggleFullscreen = useCallback((containerRef: React.RefObject<HTMLDivElement>) => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Sync fullscreen state with browser events (e.g. Escape key exit)
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  const togglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (mediaRef.current) {
        await mediaRef.current.requestPictureInPicture();
      }
    } catch {}
  }, []);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const onEnterPiP = () => setIsPiP(true);
    const onLeavePiP = () => setIsPiP(false);
    el.addEventListener("enterpictureinpicture", onEnterPiP);
    el.addEventListener("leavepictureinpicture", onLeavePiP);
    return () => {
      el.removeEventListener("enterpictureinpicture", onEnterPiP);
      el.removeEventListener("leavepictureinpicture", onLeavePiP);
    };
  }, [currentIndex]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: MediaFile[] = Array.from(files)
      .filter((f) => f.type.startsWith("video/") || f.type.startsWith("audio/"))
      .map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type.startsWith("video/") ? "video" as const : "audio" as const,
      }));

    setPlaylist((prev) => {
      const updated = [...prev, ...newFiles];
      if (prev.length === 0 && newFiles.length > 0) {
        setCurrentIndex(0);
      }
      return updated;
    });
  }, []);

  const playIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    if (isShuffle) {
      const next = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(next);
    } else {
      setCurrentIndex((i) => (i + 1) % playlist.length);
    }
  }, [playlist.length, isShuffle]);

  const playPrev = useCallback(() => {
    if (playlist.length === 0) return;
    if (currentTime > 3) {
      seek(0);
    } else {
      setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length);
    }
  }, [playlist.length, currentTime, seek]);

  const removeFromPlaylist = useCallback((index: number) => {
    setPlaylist((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (index === currentIndex) {
        if (updated.length === 0) setCurrentIndex(-1);
        else setCurrentIndex(Math.min(index, updated.length - 1));
      } else if (index < currentIndex) {
        setCurrentIndex((i) => i - 1);
      }
      return updated;
    });
  }, [currentIndex]);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentIndex(-1);
  }, []);

  const skipForward = useCallback((seconds = 10) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.min(mediaRef.current.currentTime + seconds, duration);
    }
  }, [duration]);

  const skipBackward = useCallback((seconds = 10) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(mediaRef.current.currentTime - seconds, 0);
    }
  }, []);

  const loadSubtitleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setSubtitleCues(parseSRT(content));
        setSubtitlesEnabled(true);
      }
    };
    reader.readAsText(file);
  }, []);

  const clearSubtitles = useCallback(() => {
    setSubtitleCues([]);
  }, []);

  const toggleSubtitles = useCallback(() => {
    setSubtitlesEnabled((v) => !v);
  }, []);

  // Sync media element events
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () => setDuration(el.duration);
    const onEnded = () => {
      if (isLooping) {
        el.currentTime = 0;
        el.play();
      } else {
        playNext();
      }
    };
    const onProgress = () => {
      if (el.buffered.length > 0) {
        setBuffered(el.buffered.end(el.buffered.length - 1));
      }
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("ended", onEnded);
    el.addEventListener("progress", onProgress);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("progress", onProgress);
    };
  }, [currentIndex, isLooping, playNext]);

  // Auto-play on track change
  useEffect(() => {
    if (currentFile && mediaRef.current) {
      mediaRef.current.load();
      mediaRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          skipForward(e.shiftKey ? 30 : 10);
          break;
        case "ArrowLeft":
          skipBackward(e.shiftKey ? 30 : 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, skipForward, skipBackward, setVolume, volume, toggleMute]);

  return {
    mediaRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    isPiP,
    isLooping,
    isShuffle,
    playlist,
    currentIndex,
    currentFile,
    buffered,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    togglePiP,
    setIsLooping: () => setIsLooping((v) => !v),
    setIsShuffle: () => setIsShuffle((v) => !v),
    addFiles,
    playIndex,
    playNext,
    playPrev,
    removeFromPlaylist,
    clearPlaylist,
    skipForward,
    skipBackward,
    subtitleCues,
    subtitlesEnabled,
    loadSubtitleFile,
    clearSubtitles,
    toggleSubtitles,
  };
}
