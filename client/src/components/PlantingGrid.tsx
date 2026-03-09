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
  compact?: boolean;
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

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  vegetable: { bg: "bg-green-600/80", text: "text-green-100", dot: "bg-green-500" },
  herb:      { bg: "bg-amber-500/80", text: "text-amber-100", dot: "bg-amber-400" },
  flower:    { bg: "bg-pink-500/80",  text: "text-pink-100",  dot: "bg-pink-400" },
  fruit:     { bg: "bg-orange-500/80", text: "text-orange-100", dot: "bg-orange-400" },
};

function getTypeColor(type: string) {
  return TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS.vegetable;
}

function abbreviateName(name: string): string {
  const words = name.split(/\s+/);
  if (name.length <= 5) return name;
  if (words.length === 1) return name.slice(0, 4);
  return words.map(w => w[0]).join("").toUpperCase().slice(0, 4);
}

export function PlantingGrid({ garden, plants, selectedTool, selectedPlantId, onCellClick, onInspect, plotIndex, plotLabel, compact = false }: PlantingGridProps) {
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

  const cellSize = compact ? "48px" : "80px";

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      {plotLabel && (
        <div className="text-sm font-semibold text-foreground/70 font-heading" data-testid={`text-plot-label-${plotIndex}`}>
          {plotLabel}
        </div>
      )}
      <div
        className="soil-texture shadow-2xl rounded-xl border-4 border-[#5c4033] p-2 relative"
        data-testid={`grid-plot-${plotIndex}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${garden.width}, ${cellSize})`,
          gridTemplateRows: `repeat(${garden.length}, ${cellSize})`,
          gap: compact ? '2px' : '4px',
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

          const typeColor = cellPlant ? getTypeColor(cellPlant.type) : null;

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
                "relative rounded-sm bg-[#4a3525] border border-[#5c4033]/50 flex items-center justify-center transition-all cursor-pointer overflow-hidden",
                selectedTool === 'plant' && "hover:bg-[#5a422e]",
                selectedTool === 'erase' && cellPlant && "hover:bg-destructive/30",
                selectedTool === 'inspect' && cellPlant && "hover:bg-primary/30 ring-2 ring-transparent hover:ring-primary z-10",
                status === 'bad' && "cell-incompatible"
              )}
              title={cellPlant ? `${cellPlant.name} (${cellPlant.type})` : `${x},${y}`}
            >
              {!compact && (
                <span className="absolute bottom-0.5 right-1 text-[9px] text-white/20 font-mono pointer-events-none">
                  {x},{y}
                </span>
              )}

              {status === 'good' && (
                <div className="absolute inset-0 ring-2 ring-primary ring-inset z-20 bg-primary/10 pointer-events-none" />
              )}

              <AnimatePresence mode="wait">
                {cellPlant && typeColor ? (
                  <motion.div
                    key={`plant-${key}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-full h-full flex flex-col items-center justify-center"
                  >
                    <div className={cn(
                      "rounded-full shadow-md flex items-center justify-center",
                      typeColor.dot,
                      compact ? "w-7 h-7" : "w-[60%] h-[60%]"
                    )}>
                      <span className={cn(
                        "font-bold text-white drop-shadow-sm",
                        compact ? "text-[8px]" : "text-[10px]"
                      )}>
                        {abbreviateName(cellPlant.name)}
                      </span>
                    </div>

                    {status === 'bad' && (
                      <div className="absolute -top-0.5 -right-0.5 bg-destructive text-white rounded-full p-0.5 z-30 shadow-md">
                        <AlertCircle className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                      </div>
                    )}
                    {status === 'good' && (
                      <div className="absolute -top-0.5 -right-0.5 bg-primary text-white rounded-full p-0.5 z-30 shadow-md">
                        <Heart className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                      </div>
                    )}

                    {!compact && (
                      <span className={cn(
                        "absolute bottom-0.5 w-[90%] text-center text-[9px] font-semibold truncate rounded px-0.5 backdrop-blur-sm pointer-events-none z-10",
                        typeColor.bg, typeColor.text
                      )}>
                        {cellPlant.name}
                      </span>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {isHovered && !cellPlant && selectedTool === 'plant' && activePlant && (
                <div className="absolute inset-0 opacity-40 flex items-center justify-center pointer-events-none">
                  <div className={cn(
                    "rounded-full border-2 border-dashed border-white/50",
                    compact ? "w-7 h-7" : "w-[60%] h-[60%]",
                    activePlant ? getTypeColor(activePlant.type).dot : "bg-primary"
                  )} />
                </div>
              )}

              {isHovered && cellPlant && selectedTool === 'erase' && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 z-40 text-white rounded-sm pointer-events-none">
                  <Trash2 className={compact ? "w-4 h-4" : "w-6 h-6"} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
