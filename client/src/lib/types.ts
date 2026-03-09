export interface Plant {
  id: number;
  name: string;
  type: string;
  spacing: number;
  sunlight: string;
  water: string;
  fertilizer: string;
  companionPlants: string[];
  incompatiblePlants: string[];
}

export type InsertPlant = Omit<Plant, "id">;
