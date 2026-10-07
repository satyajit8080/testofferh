"use client";

import { motion, useReducedMotion } from "framer-motion";

export type OverlayNode = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  /** Where the label sits relative to the node */
  anchor?: "left" | "right" | "top" | "bottom";
};

type Props = {
  nodes: OverlayNode[];
  links: [string, string][];
  /** Size factor relative to a 60-unit-tall map; scales strokes, radii and type. */
  unit?: number;
  /** Arc lift as a fraction of link length */
  bend?: number;
  idPrefix: string;
};

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }, bend: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  // Perpendicular, always lifted "up" on screen
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const cx = mx + nx * len * bend;
  const cy = my + ny * len * bend;
  return `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`;
}

/**
 * Glowing nodes and animated links, rendered as SVG <g> to be placed inside a
 * DotMap so both share coordinates.
 */
export function NetworkOverlay({ nodes, links, unit = 1, bend = 0.22, idPrefix }: Props) {
  const reduce = useReducedMotion();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const u = unit;

  return (
    <g>
      <defs>
        <linearGradient id={`${idPrefix}-link`} x1="0" x2="1">
          <stop offset="0" stopColor="#38d6ff" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#4d8dff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#38d6ff" stopOpacity="0.15" />
        </linearGradient>
        <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={0.5 * u} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {links.map(([from, to], i) => {
        const a = byId[from];
        const b = byId[to];
        if (!a || !b) return null;
        const d = arcPath(a, b, bend);
        return (
          <g key={`${from}-${to}`}>
            <motion.path
              d={d}
              fill="none"
              stroke={`url(#${idPrefix}-link)`}
              strokeWidth={0.22 * u}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: "easeInOut" }}
            />
            {/* travelling packet */}
            {!reduce && (
              <motion.path
                d={d}
                fill="none"
                stroke="#bfe9ff"
                strokeWidth={0.38 * u}
                strokeLinecap="round"
                filter={`url(#${idPrefix}-glow)`}
                initial={{ pathLength: 0.07, pathOffset: 0, opacity: 0 }}
                animate={{ pathOffset: [0, 0.093, 0.837, 0.93], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 3.2 + (i % 3) * 0.6,
                  delay: 1.6 + i * 0.5,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: "linear",
                  times: [0, 0.1, 0.9, 1],
                }}
              />
            )}
          </g>
        );
      })}

      {nodes.map((n, i) => {
        const anchor = n.anchor ?? "right";
        const off = 1.6 * u;
        const tx = anchor === "left" ? n.x - off : anchor === "right" ? n.x + off : n.x;
        const ty = anchor === "top" ? n.y - off * 1.3 : anchor === "bottom" ? n.y + off * 1.9 : n.y + 0.45 * u;
        const textAnchor = anchor === "left" ? "end" : anchor === "right" ? "start" : "middle";
        return (
          <g key={n.id}>
            {!reduce && (
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={1.2 * u}
                fill="none"
                stroke="#38d6ff"
                strokeWidth={0.12 * u}
                initial={{ r: 0.5 * u, opacity: 0.9 }}
                animate={{ r: 2.8 * u, opacity: 0 }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
              />
            )}
            <circle cx={n.x} cy={n.y} r={0.95 * u} fill="#2a6dff" opacity="0.35" />
            <circle cx={n.x} cy={n.y} r={0.5 * u} fill="#e6f6ff" filter={`url(#${idPrefix}-glow)`} />
            <text
              x={tx}
              y={ty}
              textAnchor={textAnchor}
              fontSize={1.25 * u}
              fill="#e8eefb"
              fontWeight={600}
              style={{ letterSpacing: "0.04em" }}
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                x={tx}
                y={ty + 1.3 * u}
                textAnchor={textAnchor}
                fontSize={0.85 * u}
                fill="#4d8dff"
                fontFamily="var(--font-mono)"
                style={{ letterSpacing: "0.14em" }}
              >
                {n.sub}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
