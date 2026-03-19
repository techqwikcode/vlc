import { useEffect, useRef, useCallback } from "react";

interface AudioVisualizerProps {
  mediaElement: HTMLVideoElement | null;
  isPlaying: boolean;
}

export function AudioVisualizer({ mediaElement, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const setupAudio = useCallback(() => {
    if (!mediaElement || sourceRef.current) return;

    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(mediaElement);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      contextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      // Already connected or not supported
    }
  }, [mediaElement]);

  useEffect(() => {
    if (isPlaying && mediaElement) {
      setupAudio();
      if (contextRef.current?.state === "suspended") {
        contextRef.current.resume();
      }
    }
  }, [isPlaying, mediaElement, setupAudio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barCount = bufferLength;
      const barWidth = (width / barCount) * 0.8;
      const gap = (width / barCount) * 0.2;

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255;
        const barHeight = value * height * 0.85;
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        const hue = 28;
        const lightness = 45 + value * 20;
        ctx.fillStyle = `hsla(${hue}, 100%, ${lightness}%, ${0.6 + value * 0.4})`;

        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 3);
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();
      }
    };

    if (isPlaying) {
      draw();
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, analyserRef.current]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      canvas.width = entry.contentRect.width * window.devicePixelRatio;
      canvas.height = entry.contentRect.height * window.devicePixelRatio;
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
