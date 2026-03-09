import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type GridCell = {
  plantId: number;
  count: number;
};

export type GardenBox = {
  id: string;
  name: string;
  season: string;
  width: number;
  length: number;
  plotCount: number;
  grid: Record<string, GridCell>;
  createdAt: number;
};

export function cellKey(plotIndex: number, x: number, y: number): string {
  return plotIndex === 0 ? `${x},${y}` : `${plotIndex}:${x},${y}`;
}

export function parseCellKey(key: string): { plotIndex: number; x: number; y: number } {
  if (key.includes(':')) {
    const [pStr, coords] = key.split(':');
    const [x, y] = coords.split(',').map(Number);
    return { plotIndex: Number(pStr), x, y };
  }
  const [x, y] = key.split(',').map(Number);
  return { plotIndex: 0, x, y };
}

export function getPlotGrid(grid: Record<string, GridCell>, plotIndex: number): Record<string, GridCell> {
  const result: Record<string, GridCell> = {};
  for (const [key, cell] of Object.entries(grid)) {
    const parsed = parseCellKey(key);
    if (parsed.plotIndex === plotIndex) {
      result[`${parsed.x},${parsed.y}`] = cell;
    }
  }
  return result;
}

interface GardenStore {
  gardens: GardenBox[];
  addGarden: (name: string, width: number, length: number, season?: string, plotCount?: number) => string;
  deleteGarden: (id: string) => void;
  updateGardenName: (id: string, name: string) => void;
  duplicateGarden: (id: string) => string | null;
  importGardens: (gardens: GardenBox[], plantIdMap?: Record<number, number>) => void;
  plantInCell: (gardenId: string, x: number, y: number, plantId: number, spacing: number, plotIndex?: number) => void;
  removePlantFromCell: (gardenId: string, x: number, y: number, plotIndex?: number) => void;
  clearGarden: (gardenId: string) => void;
}

export const useGardenStore = create<GardenStore>()(
  persist(
    (set) => ({
      gardens: [],

      addGarden: (name, width, length, season = "", plotCount = 1) => {
        const id = uuidv4();
        let added = false;
        set((state) => {
          if (state.gardens.length >= 12) return state;
          added = true;
          return {
            gardens: [
              ...state.gardens,
              { id, name, season, width, length, plotCount: Math.min(Math.max(plotCount, 1), 12), grid: {}, createdAt: Date.now() },
            ],
          };
        });
        return added ? id : "";
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
          if (state.gardens.length >= 12) return state;
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
          const remaining = 12 - state.gardens.length;
          if (remaining <= 0) return state;
          const existingIds = new Set(state.gardens.map((g) => g.id));
          const newGardens = incoming.slice(0, remaining).map((g) => {
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
            return { ...g, id: newId, grid, plotCount: g.plotCount || 1 };
          });
          return { gardens: [...state.gardens, ...newGardens] };
        });
      },

      plantInCell: (gardenId, x, y, plantId, spacing, plotIndex = 0) =>
        set((state) => {
          const maxPerFoot = Math.max(1, Math.floor(144 / (spacing * spacing)));
          return {
            gardens: state.gardens.map((g) => {
              if (g.id !== gardenId) return g;
              const newGrid = { ...g.grid };
              const key = cellKey(plotIndex, x, y);
              newGrid[key] = { plantId, count: maxPerFoot };
              return { ...g, grid: newGrid };
            }),
          };
        }),

      removePlantFromCell: (gardenId, x, y, plotIndex = 0) =>
        set((state) => ({
          gardens: state.gardens.map((g) => {
            if (g.id !== gardenId) return g;
            const newGrid = { ...g.grid };
            delete newGrid[cellKey(plotIndex, x, y)];
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
