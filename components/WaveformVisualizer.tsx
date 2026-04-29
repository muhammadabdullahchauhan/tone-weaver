"use client";

import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  data?: number[];
  isAnimating?: boolean;
  color?: string;
  secondaryColor?: string;
  height?: number;
  barWidth?: number;
  barGap?: number;
  label?: string;
  type?: "bars" | "line" | "mirror";
}

export default function WaveformVisualizer({
  data,
  isAnimating = false,
  color = "#6366f1",
  secondaryColor = "#ec4899",
  height = 80,
  barWidth = 3,
  barGap = 2,
  label,
  type = "bars",
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      ctx.clearRect(0, 0, W, H);

      if (type === "bars") {
        const totalBarWidth = barWidth + barGap;
        const numBars = Math.floor(W / totalBarWidth);
        const gradient = ctx.createLinearGradient(0, 0, W, 0);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = gradient;

        for (let i = 0; i < numBars; i++) {
          let amplitude: number;
          if (isAnimating) {
            amplitude =
              0.3 +
              0.7 *
                Math.abs(
                  Math.sin(phaseRef.current + i * 0.3) *
                    Math.sin(phaseRef.current * 0.7 + i * 0.1)
                );
          } else if (data && data.length > 0) {
            const idx = Math.floor((i / numBars) * data.length);
            amplitude = data[idx] ?? 0.2;
          } else {
            amplitude = 0.15 + 0.1 * Math.sin(i * 0.4);
          }

          const barH = Math.max(2, amplitude * H * 0.9);
          const x = i * totalBarWidth;
          const y = (H - barH) / 2;
          const radius = barWidth / 2;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, radius);
          ctx.fill();
        }
      } else if (type === "mirror") {
        const gradient = ctx.createLinearGradient(0, 0, W, 0);
        gradient.addColorStop(0, color + "aa");
        gradient.addColorStop(0.5, secondaryColor + "dd");
        gradient.addColorStop(1, color + "aa");
        ctx.fillStyle = gradient;

        const totalBarWidth = barWidth + barGap;
        const numBars = Math.floor(W / totalBarWidth);
        for (let i = 0; i < numBars; i++) {
          let amplitude: number;
          if (isAnimating) {
            amplitude = 0.2 + 0.8 * Math.abs(Math.sin(phaseRef.current + i * 0.25) * 0.7);
          } else if (data && data.length > 0) {
            const idx = Math.floor((i / numBars) * data.length);
            amplitude = (data[idx] ?? 0.2) * 0.9;
          } else {
            amplitude = 0.2;
          }
          const barH = Math.max(2, amplitude * (H / 2) * 0.9);
          const x = i * totalBarWidth;
          const midY = H / 2;
          ctx.beginPath();
          ctx.roundRect(x, midY - barH, barWidth, barH * 2, barWidth / 2);
          ctx.fill();
        }
      } else {
        // line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        const points = 100;
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * W;
          let amplitude: number;
          if (isAnimating) {
            amplitude = Math.sin(phaseRef.current + i * 0.2) * Math.sin(phaseRef.current * 0.5 + i * 0.05);
          } else if (data && data.length > 0) {
            const idx = Math.floor((i / points) * data.length);
            amplitude = (data[idx] ?? 0) * 2 - 1;
          } else {
            amplitude = Math.sin(i * 0.2) * 0.2;
          }
          const y = H / 2 + amplitude * (H * 0.4);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (isAnimating) {
        phaseRef.current += 0.08;
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    if (isAnimating) {
      animFrameRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [data, isAnimating, color, secondaryColor, barWidth, barGap, type]);

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
      )}
      <div
        className="w-full rounded-xl overflow-hidden bg-white/3 border border-white/8"
        style={{ height }}
      >
        <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
      </div>
    </div>
  );
}
