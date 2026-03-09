import { useMemo } from "react";
import { lookupZoneByState, type LocationResult } from "@/lib/zone-data";

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
