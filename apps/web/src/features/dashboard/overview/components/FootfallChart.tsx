import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Users, TrendingUp } from 'lucide-react';
import type { HourlyFootfallData } from '@/lib/mockData';

interface FootfallChartProps {
  data: HourlyFootfallData[];
}

export const FootfallChart: React.FC<FootfallChartProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<HourlyFootfallData | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.footfall, d.average))) * 1.15 || 150;
  const width = 600;
  const height = 180;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (d.footfall / maxVal) * height;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2 font-serif font-semibold" style={{ color: 'var(--fg)' }}>
            <Users className="w-4 h-4" style={{ color: 'var(--fg-subtle)' }} />
            <span>24-Hour Shopper Velocity</span>
          </CardTitle>
          <CardDescription style={{ color: 'var(--fg-muted)' }}>Live hourly counts aggregated from vision nodes</CardDescription>
        </div>
        <div
          className="flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'var(--status-ok-bg)', color: 'var(--status-ok)', border: '1px solid var(--status-ok-border)' }}
        >
          <TrendingUp className="w-3 h-3" />
          <span>+18.4% Peak</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SVG Area Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="footfallAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--chart-primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid line */}
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--border)" strokeDasharray="3 3" opacity="0.6" />

            {/* Area Fill */}
            <motion.path
              d={areaD}
              fill="url(#footfallAreaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />

            {/* Path Stroke */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="var(--chart-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />

            {/* Data Points */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                className="cursor-pointer transition-all"
                style={{ fill: 'var(--accent)', stroke: 'var(--bg-elevated)', strokeWidth: 2 }}
                onMouseEnter={() => setHoveredPoint(pt.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="absolute top-2 right-4 rounded-lg p-2.5 text-xs space-y-1 shadow-md backdrop-blur-md"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            >
              <p className="font-semibold font-mono text-[11px] uppercase" style={{ color: 'var(--fg-muted)' }}>{hoveredPoint.hour}</p>
              <div className="flex items-center gap-3">
                <span className="font-serif text-sm font-semibold" style={{ color: 'var(--fg)' }}>Footfall: {hoveredPoint.footfall}</span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--fg-subtle)' }}>Avg: {hoveredPoint.average}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chart X-Axis Labels */}
        <div className="flex justify-between text-[11px] font-mono pt-2" style={{ color: 'var(--fg-subtle)', borderTop: '1px solid var(--border)' }}>
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </CardContent>
    </Card>
  );
};
