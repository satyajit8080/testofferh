/**
 * Small "live" animated glyphs for the feature strip. Pure SVG + SMIL/CSS,
 * so they render on the server and animate without JavaScript.
 * Colours come from the theme tokens (brand / glow / ok).
 */

const box = "h-8 w-8 overflow-visible";

/** 01 — a server rack with blinking status LEDs. */
export function RackGlyph() {
  const units = [0, 1, 2, 3];
  const delays = ["0s", "0.7s", "1.3s", "0.35s", "1.8s", "1s", "0.15s", "2.1s"];
  return (
    <svg viewBox="0 0 28 28" className={box} aria-hidden="true">
      <rect x="5" y="2.5" width="18" height="23" rx="1.5" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" />
      {units.map((u) => (
        <g key={u}>
          <rect x="7.5" y={5 + u * 5.2} width="13" height="3.6" rx="0.6" fill="currentColor" fillOpacity="0.12" />
          <circle cx="10" cy={6.8 + u * 5.2} r="0.95" fill="var(--color-glow)" className="animate-blink" style={{ animationDelay: delays[u * 2] }} />
          <circle cx="12.8" cy={6.8 + u * 5.2} r="0.95" fill={u === 2 ? "var(--color-ok)" : "var(--color-brand-400)"} className="animate-blink" style={{ animationDelay: delays[u * 2 + 1], animationDuration: "1.7s" }} />
          <line x1="15.5" y1={6.8 + u * 5.2} x2="19" y2={6.8 + u * 5.2} stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  );
}

/** 02 — network nodes with packets travelling between them. */
export function NetworkGlyph() {
  const paths = ["M5 20 L14 6", "M14 6 L23 20", "M23 20 L5 20", "M14 14 L14 6"];
  return (
    <svg viewBox="0 0 28 28" className={box} aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} id={`ng-${i}`} d={d} stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" fill="none" />
      ))}
      <path d="M5 20 L14 14 L23 20" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.8" fill="none" />
      {paths.slice(0, 3).map((_, i) => (
        <circle key={i} r="1.25" fill="var(--color-glow)">
          <animateMotion dur={`${1.6 + i * 0.35}s`} begin={`${i * 0.5}s`} repeatCount="indefinite">
            <mpath href={`#ng-${i}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" dur={`${1.6 + i * 0.35}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {[
        [5, 20],
        [14, 6],
        [23, 20],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="2.4" fill="var(--color-brand-500)" fillOpacity="0.35">
            <animate attributeName="r" values="2.2;3.6;2.2" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.4;0;0.4" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r="1.7" fill="var(--color-fg)" />
        </g>
      ))}
      <circle cx="14" cy="14" r="1.6" fill="var(--color-brand-400)" />
    </svg>
  );
}

/** 03 — throughput bars moving like a live traffic graph. */
export function ThroughputGlyph() {
  const bars = [
    { x: 4, values: "10;16;8;18;12;10" },
    { x: 8.5, values: "14;7;17;11;19;14" },
    { x: 13, values: "8;18;13;20;9;8" },
    { x: 17.5, values: "17;11;20;8;15;17" },
    { x: 22, values: "12;19;9;16;11;12" },
  ];
  return (
    <svg viewBox="0 0 28 28" className={box} aria-hidden="true">
      <line x1="2.5" y1="24.5" x2="25.5" y2="24.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.8" />
      {bars.map((b, i) => (
        <rect key={i} x={b.x} width="2.6" rx="0.8" fill={i === 2 ? "var(--color-glow)" : "currentColor"} fillOpacity={i === 2 ? 0.95 : 0.75} y="12" height="12">
          <animate attributeName="height" values={b.values} dur={`${2.2 + i * 0.25}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1" />
          <animate
            attributeName="y"
            values={b.values.split(";").map((v) => String(24 - Number(v))).join(";")}
            dur={`${2.2 + i * 0.25}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"
          />
        </rect>
      ))}
    </svg>
  );
}

/** 04 — a continuously running heartbeat line. */
export function PulseGlyph() {
  const d = "M1 15 H7 L9 11 L11.5 20 L14.5 5 L17 22 L19 15 H27";
  return (
    <svg viewBox="0 0 28 28" className={box} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.2" strokeLinejoin="round" />
      <path
        d={d}
        fill="none"
        stroke="var(--color-glow)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray="28 72"
      >
        <animate attributeName="stroke-dashoffset" values="100;0" dur="1.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
