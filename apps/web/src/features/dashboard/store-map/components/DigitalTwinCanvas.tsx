import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { StoreZone, ShopperParticle } from '@/types';
import { Camera, Users, Zap } from 'lucide-react';

interface DigitalTwinCanvasProps {
  zones: StoreZone[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  isEditMode?: boolean;
}

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ShopperParticle[]>([]);

  // Initialize animated shopper particles per zone
  useEffect(() => {
    const newParticles: ShopperParticle[] = [];
    zones.forEach((zone) => {
      const count = zone.shopperCount || Math.floor((zone.density || 40) / 5);
      for (let i = 0; i < count; i++) {
        const startX = zone.x + Math.random() * zone.width;
        const startY = zone.y + Math.random() * zone.height;
        newParticles.push({
          id: `p-${zone.id}-${i}`,
          x: startX,
          y: startY,
          targetX: zone.x + Math.random() * (zone.width - 4) + 2,
          targetY: zone.y + Math.random() * (zone.height - 4) + 2,
          speed: 0.02 + Math.random() * 0.03,
          zoneId: zone.id,
        });
      }
    });
    particlesRef.current = newParticles;
  }, [zones]);

  // 60 FPS HTML5 Canvas Animation Loop for Heatmap and Smooth Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Gaussian Heatmap Blobs for each zone
      zones.forEach((zone) => {
        const zX = (zone.x / 100) * width;
        const zY = (zone.y / 100) * height;
        const zW = (zone.width / 100) * width;
        const zH = (zone.height / 100) * height;
        const centerX = zX + zW / 2;
        const centerY = zY + zH / 2;
        const density = zone.density || 30;

        const maxRadius = Math.max(zW, zH) * 0.75;
        const radialGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          5,
          centerX,
          centerY,
          maxRadius
        );

        if (density >= 80) {
          radialGradient.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
          radialGradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
          radialGradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
        } else if (density >= 55) {
          radialGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          radialGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
          radialGradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        } else {
          radialGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          radialGradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.1)');
          radialGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
        }

        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Interpolate and draw smooth particle positions (Anonymized Shopper Dots)
      particlesRef.current.forEach((p) => {
        // Linear interpolation towards target
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        // If near target, pick a new random target within parent zone
        if (Math.hypot(p.targetX - p.x, p.targetY - p.y) < 1) {
          const parentZone = zones.find((z) => z.id === p.zoneId);
          if (parentZone) {
            p.targetX = parentZone.x + Math.random() * (parentZone.width - 4) + 2;
            p.targetY = parentZone.y + Math.random() * (parentZone.height - 4) + 2;
          }
        }

        const pxPixels = (p.x / 100) * width;
        const pyPixels = (p.y / 100) * height;

        // Glow outer aura
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(pxPixels, pyPixels, 5, 0, Math.PI * 2);
        ctx.fill();

        // Core white dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pxPixels, pyPixels, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [zones]);

  // Handle Resize for Canvas
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[540px] bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl select-none"
    >
      {/* 1. Grid Background Pattern Layer */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"
      />

      {/* 2. HTML5 Canvas Heatmap & Drifting Particle Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* 3. Interactive Vector Zone Layer (SVG Overlay) */}
      <div className="absolute inset-0 z-20">
        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          const density = zone.density || 30;
          const hasCamera = Boolean(zone.cameraId);

          const getZoneBorderColor = () => {
            if (isSelected) return 'border-indigo-500 ring-2 ring-indigo-500/30';
            if (density >= 80) return 'border-rose-500/60 bg-rose-500/5';
            if (density >= 55) return 'border-indigo-500/50 bg-indigo-500/5';
            return 'border-slate-700/80 bg-slate-900/40';
          };

          return (
            <motion.div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
              className={`absolute border rounded-xl p-3 cursor-pointer backdrop-blur-sm transition-all duration-200 flex flex-col justify-between group ${getZoneBorderColor()}`}
            >
              {/* Top Header Row in Zone Box */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-white truncate drop-shadow">
                    {zone.name}
                  </span>
                </div>

                {/* Camera Node Indicator */}
                {hasCamera ? (
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping" />
                    <div className="p-1 rounded-md bg-slate-900 border border-emerald-500/50 text-emerald-400 z-10">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">No Cam</span>
                )}
              </div>

              {/* Bottom Density & Shopper Count Info */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-400" />
                  <span>{zone.shopperCount || 0} shoppers</span>
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    density >= 80
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : density >= 55
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {density}% Density
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4. Canvas Status Overlay Badge */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3 bg-slate-900/90 border border-slate-800/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-slate-300 shadow-xl">
        <span className="flex items-center gap-1.5 font-semibold text-white">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>2D Digital Twin Engine</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          60 FPS Heat Interpolation
        </span>
      </div>
    </div>
  );
};
