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

  // Generate SVG path for smooth Area fill
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
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>24-Hour Shopper Footfall Velocity</span>
          </CardTitle>
          <CardDescription>Live hourly counts aggregated from vision nodes</CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+18.4% Peak Velocity</span>
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
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

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
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />

            {/* Data Points */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                className="fill-indigo-400 hover:fill-white cursor-pointer transition-all stroke-slate-900 stroke-2"
                onMouseEnter={() => setHoveredPoint(pt.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1 shadow-lg backdrop-blur-md">
              <p className="font-semibold text-white">{hoveredPoint.hour}</p>
              <div className="flex items-center gap-3">
                <span className="text-indigo-400 font-medium">Footfall: {hoveredPoint.footfall}</span>
                <span className="text-slate-500">Avg: {hoveredPoint.average}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chart X-Axis Labels */}
        <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
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
