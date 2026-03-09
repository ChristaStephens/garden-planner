import { useState, useEffect, useMemo, useCallback } from "react";
import { lookupZoneByState, type LocationResult } from "@/lib/zone-data";

const LOCATION_CHANGE_EVENT = "garden-location-change";

export function dispatchLocationChange() {
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
}

export function useLocationData(): { city: string; state: string; zoneData: LocationResult | null } {
  const [city, setCity] = useState(() => localStorage.getItem("garden-city") || "");
  const [state, setState] = useState(() => localStorage.getItem("garden-state") || "");

  useEffect(() => {
    const handler = () => {
      setCity(localStorage.getItem("garden-city") || "");
      setState(localStorage.getItem("garden-state") || "");
    };
    window.addEventListener(LOCATION_CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(LOCATION_CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const zoneData = useMemo(() => {
    if (!state) return null;
    return lookupZoneByState(state, city);
  }, [city, state]);

  return { city, state, zoneData };
}

interface LocationParams {
  city?: string;
  state?: string;
}

interface UseLocationReturn {
  data: LocationResult | null;
  isLoading: false;
  error: null;
}

export function useLocation(params: LocationParams): UseLocationReturn {
  const data = useMemo(() => {
    if (!params.state) return null;
    return lookupZoneByState(params.state, params.city);
  }, [params.city, params.state]);

  return { data, isLoading: false, error: null };
}
