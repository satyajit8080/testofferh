import { Reveal } from "@/components/ui/Reveal";
import { buildDottedMap } from "@/lib/maps";
import { locations } from "@/lib/site";
import { LocationCards, type LocationCardData } from "./LocationCards";

// The contiguous US reads better than the full country bounding box (Alaska/Hawaii).
const regionOverrides: Record<string, { lat: { min: number; max: number }; lng: { min: number; max: number } }> = {
  us: { lat: { min: 24, max: 50 }, lng: { min: -125, max: -66 } },
};

export function LocationSelector() {
  const cards: LocationCardData[] = locations.map((loc) => {
    const map = loc.countries
      ? buildDottedMap(
          { height: 20, grid: "diagonal", countries: loc.countries, region: regionOverrides[loc.id] },
          loc.pin ? [{ id: loc.id, ...loc.pin }] : [],
        )
      : buildDottedMap({ height: 16, grid: "diagonal" });
    return { ...loc, map };
  });

  return (
    <div id="locations" className="mt-24 scroll-mt-28">
      <Reveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Data Center Locations</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">Deploy Where You Need It</h3>
        </div>
        <p className="max-w-sm text-sm text-muted">Select a region to view where your infrastructure will be deployed.</p>
      </Reveal>
      <LocationCards cards={cards} />
    </div>
  );
}
