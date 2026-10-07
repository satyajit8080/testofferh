/**
 * Procedural, perspective-correct data-center aisle drawn in SVG.
 * Fully deterministic (seeded) so server and client markup match.
 */

const W = 800;
const H = 600;
const VP = { x: 400, y: 250 }; // vanishing point
const S = 420; // focal scale

const project = (X: number, Y: number, z: number) => ({ x: VP.x + (S * X) / z, y: VP.y + (S * Y) / z });

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const TOP = -1.05;
const BOTTOM = 1.15;
const UNITS = 16;

type Rack = { side: -1 | 1; z0: number; z1: number };

function buildRacks(): Rack[] {
  const racks: Rack[] = [];
  let z = 0.9;
  while (z < 9) {
    const depth = 0.62;
    racks.push({ side: -1, z0: z, z1: z + depth }, { side: 1, z0: z, z1: z + depth });
    z += depth + 0.04;
  }
  return racks;
}

const quad = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

export function ServerAisle({ className, idPrefix = "aisle" }: { className?: string; idPrefix?: string }) {
  const rand = rng(208220);
  const racks = buildRacks();
  const leds: { x: number; y: number; r: number; color: string; blink: boolean; delay: number; o: number }[] = [];
  const unitLines: string[] = [];

  for (const rack of racks) {
    const X = rack.side;
    for (let u = 1; u < UNITS; u++) {
      const Y = TOP + ((BOTTOM - TOP) * u) / UNITS;
      const a = project(X, Y, rack.z0);
      const b = project(X, Y, rack.z1);
      unitLines.push(`M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`);

      // LEDs sit just inside the front of each unit
      const count = rand() > 0.35 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const zl = rack.z0 + 0.06 + i * 0.07 + rand() * 0.02;
        const p = project(X, Y - (BOTTOM - TOP) / UNITS / 2, zl);
        const roll = rand();
        leds.push({
          x: p.x,
          y: p.y,
          r: Math.max(0.6, 5.5 / zl),
          color: roll > 0.92 ? "#2fd47a" : roll > 0.55 ? "#38d6ff" : "#4d8dff",
          blink: rand() > 0.72,
          delay: rand() * 3,
          o: Math.min(1, 0.35 + 1.6 / zl),
        });
      }
    }
  }

  // Far wall and the light strips along the ceiling
  const far = 9.4;
  const fwTL = project(-1, TOP - 0.2, far);
  const fwBR = project(1, BOTTOM, far);
  const lightL = [project(-0.55, TOP - 0.22, 0.6), project(-0.55, TOP - 0.22, far)];
  const lightR = [project(0.55, TOP - 0.22, 0.6), project(0.55, TOP - 0.22, far)];
  const floorL = [project(-1, BOTTOM, 0.6), project(-1, BOTTOM, far)];
  const floorR = [project(1, BOTTOM, 0.6), project(1, BOTTOM, far)];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${idPrefix}-rack-face-l`} x1="0" x2="1">
          <stop offset="0" stopColor="#0d1830" />
          <stop offset="1" stopColor="#070d1a" />
        </linearGradient>
        <linearGradient id={`${idPrefix}-rack-face-r`} x1="1" x2="0">
          <stop offset="0" stopColor="#0d1830" />
          <stop offset="1" stopColor="#070d1a" />
        </linearGradient>
        <radialGradient id={`${idPrefix}-aisle-glow`} cx="0.5" cy="0.42" r="0.5">
          <stop offset="0" stopColor="#2a6dff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#1b3f99" stopOpacity="0.18" />
          <stop offset="1" stopColor="#03060c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${idPrefix}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1a3a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#03060c" stopOpacity="1" />
        </linearGradient>
        <filter id={`${idPrefix}-led-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${idPrefix}-strip-glow`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <rect width={W} height={H} fill="#03060c" />

      {/* floor */}
      <polygon
        points={quad([floorL[0], floorR[0], floorR[1], floorL[1]])}
        fill={`url(#${idPrefix}-floor)`}
      />
      {/* floor tile seams */}
      <g stroke="#2a6dff" strokeOpacity="0.12" strokeWidth="0.8">
        {[-0.5, 0, 0.5].map((X) => {
          const a = project(X, BOTTOM, 0.6);
          const b = project(X, BOTTOM, far);
          return <line key={X} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
        {[1, 1.6, 2.4, 3.4, 4.8, 6.6].map((z) => {
          const a = project(-1, BOTTOM, z);
          const b = project(1, BOTTOM, z);
          return <line key={z} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
      </g>

      {/* far wall glow */}
      <rect x={fwTL.x} y={fwTL.y} width={fwBR.x - fwTL.x} height={fwBR.y - fwTL.y} fill="#1d4fd1" opacity="0.55" />
      <rect width={W} height={H} fill={`url(#${idPrefix}-aisle-glow)`} />

      {/* racks, far to near so nearer racks overlap */}
      {[...racks].reverse().map((r, i) => {
        const pts = [project(r.side, TOP, r.z0), project(r.side, TOP, r.z1), project(r.side, BOTTOM, r.z1), project(r.side, BOTTOM, r.z0)];
        return (
          <polygon
            key={i}
            points={quad(pts)}
            fill={r.side < 0 ? `url(#${idPrefix}-rack-face-l)` : `url(#${idPrefix}-rack-face-r)`}
            stroke="#3a6bd6"
            strokeOpacity={Math.min(0.55, 0.9 / r.z0)}
            strokeWidth={Math.max(0.4, 1.4 / r.z0)}
          />
        );
      })}

      <path d={unitLines.join("")} stroke="#5d84d6" strokeOpacity="0.16" strokeWidth="0.7" fill="none" />

      <g filter={`url(#${idPrefix}-led-glow)`}>
        {leds.map((l, i) => (
          <circle
            key={i}
            cx={l.x.toFixed(1)}
            cy={l.y.toFixed(1)}
            r={l.r.toFixed(2)}
            fill={l.color}
            opacity={l.o.toFixed(2)}
            className={l.blink ? "animate-blink" : undefined}
            style={l.blink ? { animationDelay: `${l.delay.toFixed(2)}s` } : undefined}
          />
        ))}
      </g>

      {/* ceiling light strips */}
      <g stroke="#7fc8ff" strokeLinecap="round">
        <line x1={lightL[0].x} y1={lightL[0].y} x2={lightL[1].x} y2={lightL[1].y} strokeWidth="10" opacity="0.35" filter={`url(#${idPrefix}-strip-glow)`} />
        <line x1={lightR[0].x} y1={lightR[0].y} x2={lightR[1].x} y2={lightR[1].y} strokeWidth="10" opacity="0.35" filter={`url(#${idPrefix}-strip-glow)`} />
        <line x1={lightL[0].x} y1={lightL[0].y} x2={lightL[1].x} y2={lightL[1].y} strokeWidth="2" opacity="0.9" />
        <line x1={lightR[0].x} y1={lightR[0].y} x2={lightR[1].x} y2={lightR[1].y} strokeWidth="2" opacity="0.9" />
      </g>
    </svg>
  );
}
