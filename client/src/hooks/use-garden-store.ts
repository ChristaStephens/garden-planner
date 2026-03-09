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
  season: string;
  width: number; // in feet
  length: number; // in feet
  grid: Record<string, GridCell>; // key is "x,y" e.g., "0,0"
  createdAt: number;
};

interface GardenStore {
  gardens: GardenBox[];
  addGarden: (name: string, width: number, length: number, season?: string) => string;
  deleteGarden: (id: string) => void;
  updateGardenName: (id: string, name: string) => void;
  duplicateGarden: (id: string) => string | null;
  importGardens: (gardens: GardenBox[], plantIdMap?: Record<number, number>) => void;
  plantInCell: (gardenId: string, x: number, y: number, plantId: number, spacing: number) => void;
  removePlantFromCell: (gardenId: string, x: number, y: number) => void;
  clearGarden: (gardenId: string) => void;
}

export const useGardenStore = create<GardenStore>()(
  persist(
    (set) => ({
      gardens: [],
      
      addGarden: (name, width, length, season = "") => {
        const id = uuidv4();
        set((state) => ({
          gardens: [
            ...state.gardens,
            { id, name, season, width, length, grid: {}, createdAt: Date.now() },
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

      duplicateGarden: (id) => {
        const newId = uuidv4();
        let found = false;
        set((state) => {
          const source = state.gardens.find((g) => g.id === id);
          if (!source) return state;
          found = true;
          const copy: GardenBox = {
            ...source,
            id: newId,
            name: `${source.name} (Copy)`,
            grid: { ...source.grid },
            createdAt: Date.now(),
          };
          return { gardens: [...state.gardens, copy] };
        });
        return found ? newId : null;
      },

      importGardens: (incoming, plantIdMap) => {
        set((state) => {
          const existingIds = new Set(state.gardens.map((g) => g.id));
          const newGardens = incoming.map((g) => {
            const newId = existingIds.has(g.id) ? uuidv4() : g.id;
            let grid = g.grid;
            if (plantIdMap && Object.keys(plantIdMap).length > 0) {
              grid = {};
              for (const [key, cell] of Object.entries(g.grid)) {
                const mappedId = plantIdMap[cell.plantId];
                if (mappedId !== undefined) {
                  grid[key] = { ...cell, plantId: mappedId };
                } else {
                  grid[key] = cell;
                }
              }
            }
            return { ...g, id: newId, grid };
          });
          return { gardens: [...state.gardens, ...newGardens] };
        });
      },

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
