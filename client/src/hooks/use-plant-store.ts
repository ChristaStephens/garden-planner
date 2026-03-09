import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plant, InsertPlant } from "@/lib/types";

const SEED_PLANTS: InsertPlant[] = [
  {
    name: "Tomato",
    type: "Vegetable",
    spacing: 24,
    sunlight: "Full Sun",
    water: "1-2 inches per week",
    fertilizer: "High phosphorus/potassium",
    companionPlants: ["Basil", "Marigold", "Carrot", "Onion"],
    incompatiblePlants: ["Potato", "Cabbage", "Corn"],
  },
  {
    name: "Basil",
    type: "Herb",
    spacing: 12,
    sunlight: "Full Sun",
    water: "Keep soil moist",
    fertilizer: "Balanced organic",
    companionPlants: ["Tomato", "Pepper", "Oregano"],
    incompatiblePlants: ["Rue"],
  },
  {
    name: "Carrot",
    type: "Vegetable",
    spacing: 3,
    sunlight: "Full to Partial Sun",
    water: "1 inch per week",
    fertilizer: "Low nitrogen",
    companionPlants: ["Tomato", "Onion", "Rosemary", "Lettuce"],
    incompatiblePlants: ["Dill", "Parsnip"],
  },
  {
    name: "Marigold",
    type: "Flower",
    spacing: 10,
    sunlight: "Full Sun",
    water: "Allow soil to dry between watering",
    fertilizer: "Light balanced fertilizer",
    companionPlants: ["Tomato", "Cucumber", "Melon", "Squash"],
    incompatiblePlants: [],
  },
  {
    name: "Lettuce",
    type: "Vegetable",
    spacing: 6,
    sunlight: "Partial Shade",
    water: "Keep soil consistently moist",
    fertilizer: "High nitrogen",
    companionPlants: ["Carrot", "Radish", "Strawberry"],
    incompatiblePlants: ["Cabbage", "Parsley"],
  },
  {
    name: "Pepper",
    type: "Vegetable",
    spacing: 18,
    sunlight: "Full Sun",
    water: "1-2 inches per week",
    fertilizer: "Balanced, then high phosphorus",
    companionPlants: ["Basil", "Onion", "Spinach", "Tomato"],
    incompatiblePlants: ["Beans", "Fennel"],
  },
  {
    name: "Cucumber",
    type: "Vegetable",
    spacing: 12,
    sunlight: "Full Sun",
    water: "1-2 inches per week",
    fertilizer: "High nitrogen then balanced",
    companionPlants: ["Radish", "Sunflower", "Marigold"],
    incompatiblePlants: ["Potato", "Sage"],
  },
];

interface PlantStore {
  plants: Plant[];
  nextId: number;
  getPlants: () => Plant[];
  addPlant: (plant: InsertPlant) => Plant;
  deletePlant: (id: number) => void;
  importPlants: (incoming: Plant[]) => Record<number, number>;
  resetToDefaults: () => void;
}

function createDefaultState() {
  const plants: Plant[] = SEED_PLANTS.map((p, i) => ({ ...p, id: i + 1 }));
  return { plants, nextId: plants.length + 1 };
}

export const usePlantStore = create<PlantStore>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),
      getPlants: () => get().plants,
      addPlant: (input: InsertPlant) => {
        const id = get().nextId;
        const newPlant: Plant = { ...input, id };
        set((state) => ({
          plants: [...state.plants, newPlant],
          nextId: state.nextId + 1,
        }));
        return newPlant;
      },
      deletePlant: (id: number) => {
        set((state) => ({
          plants: state.plants.filter((p) => p.id !== id),
        }));
      },
      importPlants: (incoming: Plant[]): Record<number, number> => {
        const idMap: Record<number, number> = {};
        set((state) => {
          const existingByName = new Map(
            state.plants.map((p) => [p.name.toLowerCase(), p.id])
          );
          let currentId = state.nextId;
          const newPlants: Plant[] = [];

          for (const p of incoming) {
            const existing = existingByName.get(p.name.toLowerCase());
            if (existing !== undefined) {
              idMap[p.id] = existing;
            } else {
              const newId = currentId++;
              idMap[p.id] = newId;
              newPlants.push({ ...p, id: newId });
              existingByName.set(p.name.toLowerCase(), newId);
            }
          }

          return {
            plants: [...state.plants, ...newPlants],
            nextId: currentId,
          };
        });
        return idMap;
      },
      resetToDefaults: () => {
        set(createDefaultState());
      },
    }),
    {
      name: "garden-planner-plants",
    }
  )
);
