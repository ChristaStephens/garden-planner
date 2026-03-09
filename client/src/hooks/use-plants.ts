import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Plant } from "@shared/schema";

export function usePlants() {
  return useQuery({
    queryKey: [api.plants.list.path],
    queryFn: async () => {
      const res = await fetch(api.plants.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch plants");
      const data = await res.json();
      return api.plants.list.responses[200].parse(data);
    },
  });
}
