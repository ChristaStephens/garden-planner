import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type GridCell = {
  plantId: number;
  count: number; // How many plants fit in this 1x1 cell
};

export type GardenBox = {
  id: string;
  name: string;
  width: number; // in feet
  length: number; // in feet
  grid: Record<string, GridCell>; // key is "x,y" e.g., "0,0"
  createdAt: number;
};

interface GardenStore {
  gardens: GardenBox[];
  addGarden: (name: string, width: number, length: number) => string;
  deleteGarden: (id: string) => void;
  updateGardenName: (id: string, name: string) => void;
  plantInCell: (gardenId: string, x: number, y: number, plantId: number, spacing: number) => void;
  removePlantFromCell: (gardenId: string, x: number, y: number) => void;
  clearGarden: (gardenId: string) => void;
}

export const useGardenStore = create<GardenStore>()(
  persist(
    (set) => ({
      gardens: [],
      
      addGarden: (name, width, length) => {
        const id = uuidv4();
        set((state) => ({
          gardens: [
            ...state.gardens,
            { id, name, width, length, grid: {}, createdAt: Date.now() },
          ],
        }));
        return id;
      },
      
      deleteGarden: (id) => 
        set((state) => ({
          gardens: state.gardens.filter((g) => g.id !== id),
        })),
        
      updateGardenName: (id, name) =>
        set((state) => ({
          gardens: state.gardens.map((g) => 
            g.id === id ? { ...g, name } : g
          ),
        })),

      plantInCell: (gardenId, x, y, plantId, spacing) => 
        set((state) => {
          // Calculate how many fit in 1 sq ft (144 sq inches)
          // Rough approximation: area of 1 sq ft / area of plant spacing
          const maxPerFoot = Math.max(1, Math.floor(144 / (spacing * spacing)));
          
          return {
            gardens: state.gardens.map((g) => {
              if (g.id !== gardenId) return g;
              
              const newGrid = { ...g.grid };
              const key = `${x},${y}`;
              newGrid[key] = { plantId, count: maxPerFoot };
              
              return { ...g, grid: newGrid };
            }),
          };
        }),

      removePlantFromCell: (gardenId, x, y) =>
        set((state) => ({
          gardens: state.gardens.map((g) => {
            if (g.id !== gardenId) return g;
            const newGrid = { ...g.grid };
            delete newGrid[`${x},${y}`];
            return { ...g, grid: newGrid };
          }),
        })),

      clearGarden: (gardenId) =>
        set((state) => ({
          gardens: state.gardens.map((g) => 
            g.id === gardenId ? { ...g, grid: {} } : g
          )
        }))
    }),
    {
      name: 'garden-planner-storage',
    }
  )
);
