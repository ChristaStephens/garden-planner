import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GardenBox } from "@/hooks/use-garden-store";
import { getPlotGrid } from "@/hooks/use-garden-store";
import type { Plant } from "@/lib/types";

interface PlantingGridProps {
  garden: GardenBox;
  plants: Plant[];
  selectedTool: "plant" | "erase" | "inspect";
  selectedPlantId: number | null;
  onCellClick: (x: number, y: number, plotIndex: number) => void;
  onInspect: (plantId: number) => void;
  plotIndex: number;
  plotLabel?: string;
}

function evaluateCell(x: number, y: number, currentPlantId: number, grid: Record<string, GridCellLike>, plants: Plant[]) {
  const currentPlant = plants.find(p => p.id === currentPlantId);
  if (!currentPlant) return 'neutral';

  const neighbors = [
    grid[`${x-1},${y}`],
    grid[`${x+1},${y}`],
    grid[`${x},${y-1}`],
    grid[`${x},${y+1}`]
  ].filter(Boolean);

  let status: 'neutral' | 'good' | 'bad' = 'neutral';

  for (const neighbor of neighbors) {
    const neighborPlant = plants.find(p => p.id === neighbor.plantId);
    if (!neighborPlant) continue;

    if (currentPlant.incompatiblePlants.includes(neighborPlant.name) ||
        neighborPlant.incompatiblePlants.includes(currentPlant.name)) {
      return 'bad';
    }

    if (currentPlant.companionPlants.includes(neighborPlant.name) ||
        neighborPlant.companionPlants.includes(currentPlant.name)) {
      status = 'good';
    }
  }

  return status;
}

type GridCellLike = { plantId: number; count: number };

export function PlantingGrid({ garden, plants, selectedTool, selectedPlantId, onCellClick, onInspect, plotIndex, plotLabel }: PlantingGridProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const plotGrid = useMemo(() => getPlotGrid(garden.grid, plotIndex), [garden.grid, plotIndex]);

  const cells = useMemo(() => {
    const result = [];
    for (let y = 0; y < garden.length; y++) {
      for (let x = 0; x < garden.width; x++) {
        result.push({ x, y, key: `${x},${y}` });
      }
    }
    return result;
  }, [garden.width, garden.length]);

  const activePlant = plants.find(p => p.id === selectedPlantId);

  return (
    <div className="flex flex-col items-center gap-2">
      {plotLabel && (
        <div className="text-sm font-semibold text-foreground/70 font-heading" data-testid={`text-plot-label-${plotIndex}`}>
          {plotLabel}
        </div>
      )}
      <div
        className="soil-texture shadow-2xl rounded-xl border-4 border-[#5c4033] p-4 relative"
        data-testid={`grid-plot-${plotIndex}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${garden.width}, minmax(80px, 1fr))`,
          gridTemplateRows: `repeat(${garden.length}, minmax(80px, 1fr))`,
          gap: '4px',
          backgroundColor: '#3d2b1f',
        }}
      >
        {cells.map(({ x, y, key }) => {
          const cellData = plotGrid[key];
          const cellPlant = cellData ? plants.find(p => p.id === cellData.plantId) : null;
          const isHovered = hoveredCell === key;

          let status = 'neutral';
          if (cellPlant) {
            status = evaluateCell(x, y, cellPlant.id, plotGrid, plants);
          } else if (isHovered && selectedTool === 'plant' && activePlant) {
            status = evaluateCell(x, y, activePlant.id, plotGrid, plants);
          }

          const rotation = ((x * 13 + y * 7) % 4) * 90;

          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredCell(key)}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => {
                if (selectedTool === 'inspect' && cellPlant) {
                  onInspect(cellPlant.id);
                } else {
                  onCellClick(x, y, plotIndex);
                }
              }}
              className={cn(
                "relative rounded-sm aspect-square bg-[#4a3525] border border-[#5c4033]/50 flex items-center justify-center transition-all cursor-pointer overflow-hidden",
                selectedTool === 'plant' && "hover:bg-[#5a422e]",
                selectedTool === 'erase' && cellPlant && "hover:bg-destructive/30",
                selectedTool === 'inspect' && cellPlant && "hover:bg-primary/30 ring-2 ring-transparent hover:ring-primary z-10"
              )}
            >
              <span className="absolute bottom-1 right-1 text-[9px] text-white/20 font-mono pointer-events-none">
                {x},{y}
              </span>

              {status === 'bad' && (
                <div className="absolute inset-0 ring-2 ring-destructive ring-inset z-20 animate-pulse bg-destructive/10 pointer-events-none" />
              )}
              {status === 'good' && (
                <div className="absolute inset-0 ring-2 ring-primary ring-inset z-20 bg-primary/10 pointer-events-none" />
              )}

              <AnimatePresence mode="wait">
                {cellPlant ? (
                  <motion.div
                    key={`plant-${key}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-full h-full flex flex-col items-center justify-center p-1"
                  >
                    {cellData.count > 1 ? (
                       <div className="flex flex-wrap items-center justify-center gap-1 w-full h-full">
                         {Array.from({ length: Math.min(cellData.count, 9) }).map((_, i) => (
                           <div
                             key={i}
                             className="w-3 h-3 rounded-full bg-primary shadow-sm"
                             style={{ opacity: 0.8 + (Math.random() * 0.2) }}
                            />
                         ))}
                         {cellData.count > 9 && <span className="text-[8px] font-bold text-white/80">+{cellData.count-9}</span>}
                       </div>
                    ) : (
                      <div
                        className="w-[70%] h-[70%] bg-gradient-to-br from-primary to-green-800 rounded-full shadow-md relative"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                         <div className="absolute top-1 right-1 w-2 h-2 bg-green-300 rounded-full opacity-50" />
                      </div>
                    )}

                    {status === 'bad' && (
                      <div className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 z-30 shadow-md">
                        <AlertCircle className="w-3 h-3" />
                      </div>
                    )}
                    {status === 'good' && (
                      <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 z-30 shadow-md">
                        <Heart className="w-3 h-3" />
                      </div>
                    )}

                    <span className="absolute bottom-1 w-[90%] text-center text-[10px] font-semibold text-white truncate bg-black/40 rounded px-1 backdrop-blur-sm pointer-events-none z-10">
                      {cellPlant.name}
                    </span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {isHovered && !cellPlant && selectedTool === 'plant' && activePlant && (
                <div className="absolute inset-0 opacity-40 flex items-center justify-center pointer-events-none">
                  <div className="w-[70%] h-[70%] bg-primary rounded-full border-2 border-dashed border-white/50" />
                </div>
              )}

              {isHovered && cellPlant && selectedTool === 'erase' && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 z-40 text-white rounded-sm pointer-events-none">
                  <Trash2 className="w-6 h-6" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
