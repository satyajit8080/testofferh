import type { MapDots } from "@/lib/maps";

type Props = {
  map: MapDots;
  radius?: number;
  className?: string;
  /** Any SVG children (overlays) share the same coordinate system as the dots. */
  children?: React.ReactNode;
  fill?: string;
};

/** Server-rendered dotted map. Coordinates match `buildDottedMap` output. */
export function DotMap({ map, radius = 0.22, className, fill = "currentColor", children }: Props) {
  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g fill={fill}>
        {map.dots.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={radius} />
        ))}
      </g>
      {children}
    </svg>
  );
}
