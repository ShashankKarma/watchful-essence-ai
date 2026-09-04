import { apiClient, call } from "./apiClient";
import { db, save, uid } from "@/lib/demoStore";
import { currentUserId } from "./session";
import type { LocationData } from "@/lib/types";

export interface LocationRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const locationService = {
  record(payload: LocationRequest): Promise<LocationData> {
    return call(
      () => apiClient.post("/api/location", payload),
      () => {
        const data = db();
        const entry: LocationData = {
          id: uid(),
          userId: currentUserId(),
          ...payload,
          timestamp: new Date().toISOString(),
        };
        data.locations.push(entry);
        save();
        return entry;
      },
    );
  },

  current(): Promise<LocationData | null> {
    return call(
      () => apiClient.get("/api/location/current"),
      () => {
        const mine = db()
          .locations.filter((l) => l.userId === currentUserId())
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        return mine[0] ?? null;
      },
    );
  },

  history(): Promise<LocationData[]> {
    return call(
      () => apiClient.get("/api/location/history"),
      () =>
        db()
          .locations.filter((l) => l.userId === currentUserId())
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .slice(0, 25),
    );
  },

  /** Browser Geolocation API wrapper with graceful permission handling. */
  readBrowserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        reject(new Error("Location is not supported on this device"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, (err) => reject(new Error(err.message)), {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      });
    });
  },
};
