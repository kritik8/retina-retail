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

  // 60 FPS HTML5 Canvas Animation Loop for Heatmap and Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Gaussian Heatmap Blobs for each zone (Functional heatmap signals preserved)
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
          radialGradient.addColorStop(0, 'rgba(158, 72, 72, 0.40)');
          radialGradient.addColorStop(0.5, 'rgba(184, 112, 64, 0.20)');
          radialGradient.addColorStop(1, 'rgba(158, 72, 72, 0.0)');
        } else if (density >= 55) {
          radialGradient.addColorStop(0, 'rgba(212, 168, 75, 0.35)');
          radialGradient.addColorStop(0.5, 'rgba(212, 168, 75, 0.15)');
          radialGradient.addColorStop(1, 'rgba(212, 168, 75, 0.0)');
        } else {
          radialGradient.addColorStop(0, 'rgba(78, 122, 88, 0.30)');
          radialGradient.addColorStop(0.6, 'rgba(78, 122, 88, 0.10)');
          radialGradient.addColorStop(1, 'rgba(78, 122, 88, 0.0)');
        }

        ctx.fillStyle = radialGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Anonymized Shopper Dots
      particlesRef.current.forEach((p) => {
        p.x += (p.targetX - p.x) * p.speed;
        p.y += (p.targetY - p.y) * p.speed;

        if (Math.hypot(p.targetX - p.x, p.targetY - p.y) < 1) {
          const parentZone = zones.find((z) => z.id === p.zoneId);
          if (parentZone) {
            p.targetX = parentZone.x + Math.random() * (parentZone.width - 4) + 2;
            p.targetY = parentZone.y + Math.random() * (parentZone.height - 4) + 2;
          }
        }

        const pxPixels = (p.x / 100) * width;
        const pyPixels = (p.y / 100) * height;

        ctx.fillStyle = 'rgba(212, 168, 75, 0.3)';
        ctx.beginPath();
        ctx.arc(pxPixels, pyPixels, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'var(--fg)';
        ctx.beginPath();
        ctx.arc(pxPixels, pyPixels, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [zones]);

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
      className="relative w-full h-[520px] rounded-[10px] overflow-hidden select-none"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {/* Grid Pattern Layer */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* HTML5 Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Interactive Vector Zones Layer */}
      <div className="absolute inset-0 z-20">
        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          const density = zone.density || 30;
          const hasCamera = Boolean(zone.cameraId);

          return (
            <motion.div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                background: isSelected ? 'var(--accent-subtle)' : 'var(--bg)',
                borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                borderWidth: '1px',
              }}
              className="absolute rounded-lg p-3 cursor-pointer backdrop-blur-xs transition-all duration-150 flex flex-col justify-between group"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-1">
                <span className="font-serif text-xs font-semibold truncate" style={{ color: 'var(--fg)' }}>
                  {zone.name}
                </span>

                {hasCamera ? (
                  <div className="p-1 rounded-md" style={{ background: 'var(--status-ok-bg)', color: 'var(--status-ok)', border: '1px solid var(--status-ok-border)' }}>
                    <Camera className="w-3 h-3" />
                  </div>
                ) : (
                  <span className="font-mono text-[9px]" style={{ color: 'var(--fg-subtle)' }}>No Cam</span>
                )}
              </div>

              {/* Bottom Info */}
              <div className="flex items-center justify-between font-mono text-[10px] pt-1">
                <span className="flex items-center gap-1" style={{ color: 'var(--fg-muted)' }}>
                  <Users className="w-3 h-3" style={{ color: 'var(--fg-subtle)' }} />
                  <span>{zone.shopperCount || 0}</span>
                </span>

                <span
                  className="px-1.5 py-0.5 rounded-full font-semibold"
                  style={
                    density >= 80
                      ? { background: 'var(--status-err-bg)', color: 'var(--status-err)', border: '1px solid var(--status-err-border)' }
                      : density >= 55
                      ? { background: 'var(--status-warn-bg)', color: 'var(--status-warn)', border: '1px solid var(--status-warn-border)' }
                      : { background: 'var(--status-ok-bg)', color: 'var(--status-ok)', border: '1px solid var(--status-ok-border)' }
                  }
                >
                  {density}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Canvas Status Overlay */}
      <div
        className="absolute bottom-3 left-3 z-30 flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-mono shadow-sm"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg)' }}
      >
        <span className="flex items-center gap-1.5 font-medium font-sans">
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          <span>2D Digital Twin Engine</span>
        </span>
        <span style={{ color: 'var(--border-strong)' }}>|</span>
        <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--status-ok)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--status-ok)' }} />
          60 FPS Heat Interpolation
        </span>
      </div>
    </div>
  );
};
