'use client'

import { useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { Map as MapIcon } from 'lucide-react'

// #18 — Super Admin live geographic distribution map.
// Uses react-simple-maps (per design guidelines: never hand-roll geo SVG).
// Marker radius + color encode activity level. Data is illustrative until the
// backend streams live presence. TODO: BACKEND — replace points with live data.
const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

type Point = { name: string; coordinates: [number, number]; level: 'high' | 'mid' | 'low'; users: number }

const POINTS: Point[] = [
  { name: 'الكويت', coordinates: [47.98, 29.37], level: 'high', users: 4200 },
  { name: 'الرياض', coordinates: [46.72, 24.69], level: 'high', users: 3800 },
  { name: 'دبي', coordinates: [55.27, 25.2], level: 'high', users: 2600 },
  { name: 'القاهرة', coordinates: [31.24, 30.04], level: 'mid', users: 1500 },
  { name: 'بيروت', coordinates: [35.5, 33.89], level: 'mid', users: 720 },
  { name: 'لندن', coordinates: [-0.12, 51.5], level: 'low', users: 240 },
  { name: 'لوس أنجلوس', coordinates: [-118.24, 34.05], level: 'low', users: 180 },
]

const LEVEL = {
  high: { fill: 'var(--color-success)', r: 9 },
  mid: { fill: 'var(--color-primary)', r: 6.5 },
  low: { fill: 'var(--color-gold)', r: 4.5 },
}

export function GeoHeatmap() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-border p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <MapIcon className="h-5 w-5 text-primary" />
          خريطة التوزع الجغرافي النشط (Live Heatmap)
        </h3>
        <div className="hidden gap-3 sm:flex">
          <Legend color="var(--color-success)" label="نشاط عالي" />
          <Legend color="var(--color-primary)" label="نشاط متوسط" />
          <Legend color="var(--color-gold)" label="نشاط منخفض" />
        </div>
      </div>

      <div className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [20, 25] }}
          height={340}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="var(--color-secondary)"
                  stroke="var(--color-border)"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: 'var(--color-muted)', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {POINTS.map((p) => {
            const cfg = LEVEL[p.level]
            const isHovered = hovered === p.name
            const tipW = 132
            const tipH = 40
            return (
              <Marker key={p.name} coordinates={p.coordinates}>
                <g
                  onMouseEnter={() => setHovered(p.name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: 'pointer',
                    transformOrigin: 'center',
                    transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                    transition: 'transform 0.18s ease',
                  }}
                >
                  {/* pulse ring on hover */}
                  {isHovered && <circle r={cfg.r + 3} fill="none" stroke={cfg.fill} strokeWidth={1} opacity={0.6} />}
                  <circle r={cfg.r} fill={cfg.fill} fillOpacity={0.35} />
                  <circle r={cfg.r / 2.2} fill={cfg.fill} />
                  {/* invisible larger hit area for easier hovering */}
                  <circle r={cfg.r + 4} fill="transparent" />
                </g>

                {isHovered && (
                  <g transform={`translate(${-tipW / 2}, ${-cfg.r - tipH - 8})`} style={{ pointerEvents: 'none' }}>
                    <rect
                      width={tipW}
                      height={tipH}
                      rx={6}
                      fill="var(--color-popover)"
                      stroke="var(--color-border)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={tipW / 2}
                      y={15}
                      textAnchor="middle"
                      fill="var(--color-foreground)"
                      style={{ fontSize: 9, fontWeight: 700 }}
                    >
                      {p.name}
                    </text>
                    <text
                      x={tipW / 2}
                      y={29}
                      textAnchor="middle"
                      fill={cfg.fill}
                      style={{ fontSize: 8.5, fontWeight: 600 }}
                    >
                      {p.users.toLocaleString('ar-EG')} مستخدم نشط
                    </text>
                  </g>
                )}
              </Marker>
            )
          })}
        </ComposableMap>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
        <Legend color="var(--color-success)" label="نشاط عالي" />
        <Legend color="var(--color-primary)" label="نشاط متوسط" />
        <Legend color="var(--color-gold)" label="نشاط منخفض" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}
