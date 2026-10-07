import "server-only";
import DottedMap from "dotted-map";
import type { MapSettings } from "dotted-map";

/**
 * Pre-computes dotted map geometry on the server so the (large) country
 * geometry never ships to the browser. Components receive plain numbers.
 */

export type MapDots = {
  width: number;
  height: number;
  dots: [number, number][];
};

export type MapPins = Record<string, { x: number; y: number }>;

export type DottedMapData = MapDots & { pins: MapPins };

const cache = new Map<string, DottedMapData>();

export function buildDottedMap(
  settings: MapSettings,
  pins: { id: string; lat: number; lng: number }[] = [],
): DottedMapData {
  const key = JSON.stringify({ settings, pins });
  const hit = cache.get(key);
  if (hit) return hit;

  const map = new DottedMap(settings);
  const dots = map.getPoints().map((p) => [round(p.x), round(p.y)] as [number, number]);

  const pinOut: MapPins = {};
  for (const pin of pins) {
    // getPin snaps to the nearest dot so nodes always sit on the grid.
    const p = map.getPin({ lat: pin.lat, lng: pin.lng });
    if (p) pinOut[pin.id] = { x: round(p.x), y: round(p.y) };
  }

  const data = { width: map.image.width, height: map.image.height, dots, pins: pinOut };
  cache.set(key, data);
  return data;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
