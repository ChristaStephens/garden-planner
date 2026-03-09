import type { Plant } from "./types";
import type { GridCell } from "@/hooks/use-garden-store";

interface AutoPlotResult {
  grid: Record<string, GridCell>;
  placements: { plantId: number; plotIndex: number; x: number; y: number }[];
  unplaced: number[];
}

function cellKey(plotIndex: number, x: number, y: number): string {
  return plotIndex === 0 ? `${x},${y}` : `${plotIndex}:${x},${y}`;
}

function getNeighborCoords(x: number, y: number): [number, number][] {
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
}

function isIncompatible(plantA: Plant, plantB: Plant): boolean {
  return (
    plantA.incompatiblePlants.some(n => n.toLowerCase() === plantB.name.toLowerCase()) ||
    plantB.incompatiblePlants.some(n => n.toLowerCase() === plantA.name.toLowerCase())
  );
}

function isCompanion(plantA: Plant, plantB: Plant): boolean {
  return (
    plantA.companionPlants.some(n => n.toLowerCase() === plantB.name.toLowerCase()) ||
    plantB.companionPlants.some(n => n.toLowerCase() === plantA.name.toLowerCase())
  );
}

function groupByWaterSun(plants: Plant[]): Plant[][] {
  const groups: Record<string, Plant[]> = {};
  for (const plant of plants) {
    const key = `${plant.water.toLowerCase()}|${plant.sunlight.toLowerCase()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(plant);
  }
  return Object.values(groups);
}

export function autoPlot(
  selectedPlantIds: number[],
  allPlants: Plant[],
  width: number,
  length: number,
  plotCount: number
): AutoPlotResult {
  const grid: Record<string, GridCell> = {};
  const placements: AutoPlotResult["placements"] = [];
  const unplaced: number[] = [];

  const plantsById = new Map(allPlants.map(p => [p.id, p]));
  const selectedPlants = selectedPlantIds
    .map(id => plantsById.get(id))
    .filter((p): p is Plant => !!p);

  if (selectedPlants.length === 0) return { grid, placements, unplaced };

  const totalCells = width * length;
  const groups = groupByWaterSun(selectedPlants);
  groups.sort((a, b) => b.length - a.length);

  const plotAssignments: Plant[][] = Array.from({ length: plotCount }, () => []);

  for (const group of groups) {
    const sortedGroup = [...group].sort((a, b) => {
      const compA = group.filter(p => p.id !== a.id && isCompanion(a, p)).length;
      const compB = group.filter(p => p.id !== b.id && isCompanion(b, p)).length;
      return compB - compA;
    });

    for (const plant of sortedGroup) {
      let bestPlot = -1;
      let bestScore = -Infinity;

      for (let p = 0; p < plotCount; p++) {
        const existing = plotAssignments[p];
        if (existing.length >= totalCells) continue;

        let score = 0;
        let hasIncompat = false;

        for (const ep of existing) {
          if (isIncompatible(plant, ep)) {
            hasIncompat = true;
            break;
          }
          if (isCompanion(plant, ep)) score += 3;
          if (ep.water.toLowerCase() === plant.water.toLowerCase()) score += 1;
          if (ep.sunlight.toLowerCase() === plant.sunlight.toLowerCase()) score += 1;
        }

        if (hasIncompat) continue;
        if (existing.length === 0) score += 0.5;

        if (score > bestScore) {
          bestScore = score;
          bestPlot = p;
        }
      }

      if (bestPlot >= 0) {
        plotAssignments[bestPlot].push(plant);
      } else {
        unplaced.push(plant.id);
      }
    }
  }

  for (let plotIdx = 0; plotIdx < plotCount; plotIdx++) {
    const plotPlants = plotAssignments[plotIdx];
    if (plotPlants.length === 0) continue;

    const placed = new Set<string>();

    const sorted = [...plotPlants].sort((a, b) => {
      const companionCount = (p: Plant) =>
        plotPlants.filter(o => o.id !== p.id && isCompanion(p, o)).length;
      return companionCount(b) - companionCount(a);
    });

    for (const plant of sorted) {
      const cell = findBestCell(plant, plotIdx, width, length, placed, grid, plantsById);
      if (cell) {
        const [bx, by] = cell;
        const key = cellKey(plotIdx, bx, by);
        const maxPerFoot = Math.max(1, Math.floor(144 / (plant.spacing * plant.spacing)));
        grid[key] = { plantId: plant.id, count: maxPerFoot };
        placements.push({ plantId: plant.id, plotIndex: plotIdx, x: bx, y: by });
        placed.add(`${bx},${by}`);
      }
    }

    const emptyCells: [number, number][] = [];
    for (let y = 0; y < length; y++) {
      for (let x = 0; x < width; x++) {
        if (!placed.has(`${x},${y}`)) emptyCells.push([x, y]);
      }
    }

    if (emptyCells.length > 0 && sorted.length > 0) {
      for (const [ex, ey] of emptyCells) {
        let bestPlant: Plant | null = null;
        let bestScore = -Infinity;

        for (const plant of sorted) {
          let score = 0;
          let blocked = false;
          const neighbors = getNeighborCoords(ex, ey);

          for (const [nx, ny] of neighbors) {
            const nKey = cellKey(plotIdx, nx, ny);
            const nCell = grid[nKey];
            if (!nCell) continue;
            const nPlant = plantsById.get(nCell.plantId);
            if (!nPlant) continue;

            if (isIncompatible(plant, nPlant)) { blocked = true; break; }
            if (isCompanion(plant, nPlant)) score += 5;
            if (plant.id === nPlant.id) score += 2;
          }

          if (blocked) continue;
          if (score > bestScore) {
            bestScore = score;
            bestPlant = plant;
          }
        }

        if (bestPlant) {
          const key = cellKey(plotIdx, ex, ey);
          const maxPerFoot = Math.max(1, Math.floor(144 / (bestPlant.spacing * bestPlant.spacing)));
          grid[key] = { plantId: bestPlant.id, count: maxPerFoot };
          placements.push({ plantId: bestPlant.id, plotIndex: plotIdx, x: ex, y: ey });
          placed.add(`${ex},${ey}`);
        }
      }
    }
  }

  return { grid, placements, unplaced };
}

function findBestCell(
  plant: Plant,
  plotIdx: number,
  width: number,
  length: number,
  placed: Set<string>,
  grid: Record<string, GridCell>,
  plantsById: Map<number, Plant>
): [number, number] | null {
  let bestCell: [number, number] | null = null;
  let bestCellScore = -Infinity;

  for (let y = 0; y < length; y++) {
    for (let x = 0; x < width; x++) {
      if (placed.has(`${x},${y}`)) continue;

      let score = 0;
      let blocked = false;
      const neighbors = getNeighborCoords(x, y);

      for (const [nx, ny] of neighbors) {
        const nKey = `${nx},${ny}`;
        if (!placed.has(nKey)) continue;
        const nFullKey = cellKey(plotIdx, nx, ny);
        const nCell = grid[nFullKey];
        if (!nCell) continue;
        const nPlant = plantsById.get(nCell.plantId);
        if (!nPlant) continue;

        if (isIncompatible(plant, nPlant)) { blocked = true; break; }
        if (isCompanion(plant, nPlant)) score += 5;
      }

      if (blocked) continue;
      if (score > bestCellScore) {
        bestCellScore = score;
        bestCell = [x, y];
      }
    }
  }

  return bestCell;
}
