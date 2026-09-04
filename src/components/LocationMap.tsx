import { useEffect, useRef } from "react";
import type { LocationData } from "@/lib/types";

/**
 * Leaflet + OpenStreetMap map. Leaflet is imported lazily inside an effect so
 * it never runs during server rendering.
 */
export function LocationMap({
  points,
  height = 320,
}: {
  points: LocationData[];
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const first = points[0];
      const map = L.map(containerRef.current, { zoomControl: true }).setView(
        first ? [first.latitude, first.longitude] : [12.9716, 77.5946],
        first ? 14 : 12,
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      points.forEach((p, i) => {
        L.marker([p.latitude, p.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<strong>${i === 0 ? "Latest position" : "Earlier position"}</strong><br/>${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}<br/>${new Date(p.timestamp).toLocaleString()}`,
          );
      });

      if (points.length > 1) {
        L.polyline(
          points.map((p) => [p.latitude, p.longitude] as [number, number]),
          { color: "#f43f5e", weight: 3, opacity: 0.7 },
        ).addTo(map);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-xl border border-border"
    />
  );
}
