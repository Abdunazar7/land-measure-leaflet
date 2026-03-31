'use client'
import { AreaResult, formatArea, formatPerimeter } from '@/lib/geoUtils'

interface Props {
  result: AreaResult
}

const metrics = [
  { key: 'sqMeters', label: 'm²', decimals: 1 },
  { key: 'sotka', label: 'Sotka', decimals: 2 },
  { key: 'hectares', label: 'Gektar', decimals: 4 },
  { key: 'acres', label: 'Acres', decimals: 3 },
]

export default function ResultCard({ result }: Props) {
  const main = formatArea(result)

  return (
    <div className="space-y-3">
      {/* Main result */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <p className="text-xs text-green-400/70 uppercase tracking-widest mb-1">{main.label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-mono">{main.value}</span>
          <span className="text-green-400 font-semibold">{main.unit}</span>
        </div>
      </div>

      {/* Sub metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map(m => (
          <div key={m.key} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-sm font-semibold text-slate-200 font-mono">
              {Number(result[m.key as keyof AreaResult]).toFixed(m.decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
          </div>
        ))}
      </div>

      {/* Perimeter */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex justify-between items-center">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Perimetr</span>
        <span className="text-sm font-semibold text-blue-400 font-mono">
          {formatPerimeter(result.perimeter)}
        </span>
      </div>

      {/* Points */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
        <span className="text-xs text-slate-500">{result.pointCount} nuqta bilan belgilangan</span>
      </div>
    </div>
  )
}
