import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, MapPin, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { LocationMap } from "@/components/LocationMap";
import { EmptyState } from "@/components/StateViews";
import { locationService } from "@/services/locationService";
import type { LocationData } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/location")({
  head: () => ({
    meta: [
      { title: "Location — GuardianAI" },
      {
        name: "description",
        content: "Live position on OpenStreetMap with recent location history and accuracy.",
      },
      { property: "og:title", content: "Location — GuardianAI" },
      {
        property: "og:description",
        content: "Live position on OpenStreetMap with recent location history and accuracy.",
      },
    ],
  }),
  component: LocationPage,
});

function LocationPage() {
  const [history, setHistory] = useState<LocationData[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const load = () => locationService.history().then(setHistory);

  useEffect(() => {
    void load();
  }, []);

  const refresh = async () => {
    try {
      const pos = await locationService.readBrowserLocation();
      await locationService.record({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
      });
      setPermissionError(null);
      await load();
      toast.success("Location updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Location unavailable";
      setPermissionError(message);
      toast.error("Could not read your location", { description: message });
    }
  };

  const current = history[0];

  return (
    <div>
      <PageHeader
        title="Location"
        description="Captured through the browser Geolocation API and shown on OpenStreetMap."
        action={
          <button
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Crosshair className="h-4 w-4" /> Update my location
          </button>
        }
      />

      {permissionError ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-caution/40 bg-caution/10 p-4 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 text-caution" />
          <div>
            <p className="font-semibold text-caution">Location permission unavailable</p>
            <p className="text-muted-foreground">
              {permissionError}. GuardianAI keeps working with your last known position.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Current position</span>
          </div>
          {current ? (
            <>
              <p className="mt-2 font-display text-xl font-bold">
                {current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}
              </p>
              <p className="text-sm text-muted-foreground">Accuracy ±{current.accuracy} m</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Last updated {new Date(current.timestamp).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No position captured yet.</p>
          )}
        </div>

        <div className="lg:col-span-2">
          {history.length ? (
            <LocationMap points={history} height={340} />
          ) : (
            <EmptyState title="No map data" description="Update your location to plot the map." />
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="font-display text-base font-semibold">Location history</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2">Latitude</th>
                <th className="py-2">Longitude</th>
                <th className="py-2">Accuracy</th>
                <th className="py-2">Recorded</th>
              </tr>
            </thead>
            <tbody>
              {history.map((l) => (
                <tr key={l.id} className="border-t border-border/60">
                  <td className="py-2">{l.latitude.toFixed(5)}</td>
                  <td className="py-2">{l.longitude.toFixed(5)}</td>
                  <td className="py-2">±{l.accuracy} m</td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
