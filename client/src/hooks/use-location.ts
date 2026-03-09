import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

interface LocationParams {
  city?: string;
  state?: string;
}

export function useLocation(params: LocationParams) {
  return useQuery({
    // Only fetch if we have both city and state
    queryKey: [api.location.get.path, params.city, params.state],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.city) searchParams.append('city', params.city);
      if (params.state) searchParams.append('state', params.state);
      
      const url = `${api.location.get.path}?${searchParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch location data");
      }
      
      const data = await res.json();
      return api.location.get.responses[200].parse(data);
    },
    enabled: !!params.city && !!params.state,
  });
}
