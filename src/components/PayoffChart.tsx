import type { SimulationMonth, Strategy } from '../services/debtSimulation';

interface PayoffChartProps {
  data: Record<Strategy, SimulationMonth[]>;
  selectedStrategies: Strategy[];
  width?: number;
  height?: number;
}

const STRATEGY_COLORS: Record<Strategy, string> = {
  snowball: '#10B981',
  avalanche: '#8B5CF6',
  minimums: '#F59E0B',
};

const STRATEGY_LABELS: Record<Strategy, string> = {
  snowball: 'Snowball',
  avalanche: 'Avalanche',
  minimums: 'Minimums Only',
};

export default function PayoffChart({ data, selectedStrategies, width = 600, height = 300 }: PayoffChartProps) {
  // Gather all months across selected strategies
  const maxMonths = Math.max(
    ...selectedStrategies.map((s) => data[s]?.length || 0)
  );

  if (maxMonths === 0) return null;

  const maxBalance = Math.max(
    ...selectedStrategies.flatMap((s) =>
      (data[s] || []).map((m) => m.totalBalance)
    ),
    1000 // minimum for scale
  );

  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Generate Y-axis ticks
  const yTicks = 5;
  // Generate X-axis ticks (show ~6 labels)
  const xTickInterval = Math.max(1, Math.floor(maxMonths / 6));

  const points: Partial<Record<Strategy, string>> = {};
  for (const s of selectedStrategies) {
    const months = data[s] || [];
    if (months.length === 0) continue;
    const pts = months
      .map((m, i) => {
        const x = padding.left + (i / Math.max(maxMonths - 1, 1)) * chartW;
        const y = padding.top + chartH - (m.totalBalance / maxBalance) * chartH;
        return `${x},${y}`;
      })
      .join(' ');
    points[s] = pts;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto max-h-80"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines & Y-axis labels */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const y = padding.top + (i / yTicks) * chartH;
        const val = maxBalance - (i / yTicks) * maxBalance;
        return (
          <g key={`y-${i}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="text-[10px] fill-slate-400"
            >
              ${val < 1000 ? val.toFixed(0) : (val / 1000).toFixed(1) + 'k'}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {Array.from({ length: Math.min(maxMonths, maxMonths) }, (_, i) => {
        if (i % xTickInterval !== 0 && i !== maxMonths - 1) return null;
        const x = padding.left + (i / Math.max(maxMonths - 1, 1)) * chartW;
        return (
          <text
            key={`x-${i}`}
            x={x}
            y={height - padding.bottom + 16}
            textAnchor="middle"
            className="text-[10px] fill-slate-400"
          >
            M{i + 1}
          </text>
        );
      })}

      {/* Line paths */}
      {selectedStrategies.map((s) => {
        if (!points[s]) return null;
        return (
          <path
            key={s}
            d={`M${points[s]}`}
            fill="none"
            stroke={STRATEGY_COLORS[s]}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-opacity"
          />
        );
      })}

      {/* X-axis label */}
      <text
        x={width / 2}
        y={height - 4}
        textAnchor="middle"
        className="text-[11px] fill-slate-400 font-medium"
      >
        Months
      </text>

      {/* Y-axis label */}
      <text
        x={12}
        y={height / 2}
        textAnchor="middle"
        transform={`rotate(-90, 12, ${height / 2})`}
        className="text-[11px] fill-slate-400 font-medium"
      >
        Balance
      </text>
    </svg>
  );
}

export function StrategyLegend({ selectedStrategies }: { selectedStrategies: Strategy[] }) {
  return (
    <div className="flex gap-4 flex-wrap">
      {selectedStrategies.map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: STRATEGY_COLORS[s] }}
          />
          <span className="text-xs font-medium text-slate-600">
            {STRATEGY_LABELS[s]}
          </span>
        </div>
      ))}
    </div>
  );
}