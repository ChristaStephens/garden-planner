import { useState, useMemo } from "react";
import { Wand2, Check, AlertTriangle, Sprout, Droplets, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { autoPlot } from "@/lib/auto-plot";
import type { Plant } from "@/lib/types";
import type { GardenBox } from "@/hooks/use-garden-store";

interface AutoPlotDialogProps {
  garden: GardenBox;
  plants: Plant[];
  onApply: (grid: Record<string, { plantId: number; count: number }>) => void;
  children: React.ReactNode;
}

export function AutoPlotDialog({ garden, plants, onApply, children }: AutoPlotDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [preview, setPreview] = useState<ReturnType<typeof autoPlot> | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const filteredPlants = useMemo(() => {
    if (filterType === "all") return plants;
    return plants.filter(p => p.type.toLowerCase() === filterType);
  }, [plants, filterType]);

  const plantTypes = useMemo(() => {
    const types = new Set(plants.map(p => p.type.toLowerCase()));
    return ["all", ...Array.from(types)];
  }, [plants]);

  const togglePlant = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPreview(null);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredPlants.map(p => p.id)));
    setPreview(null);
  };

  const clearAll = () => {
    setSelectedIds(new Set());
    setPreview(null);
  };

  const generatePreview = () => {
    const result = autoPlot(
      Array.from(selectedIds),
      plants,
      garden.width,
      garden.length,
      garden.plotCount || 1
    );
    setPreview(result);
  };

  const applyLayout = () => {
    if (!preview) return;
    onApply(preview.grid);
    setOpen(false);
    setPreview(null);
    setSelectedIds(new Set());
  };

  const totalCells = garden.width * garden.length * (garden.plotCount || 1);
  const plantsById = new Map(plants.map(p => [p.id, p]));

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setPreview(null); } }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Auto Plot
          </DialogTitle>
          <DialogDescription>
            Select the plants you want to grow and we'll arrange them across your plots — grouping by water/sun needs and respecting companion relationships.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {plantTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors capitalize",
                  filterType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40"
                )}
                data-testid={`button-filter-${type}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} of {plants.length} selected · {totalCells} cells available
            </span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-primary font-medium hover:underline" data-testid="button-select-all">Select all</button>
              <button onClick={clearAll} className="text-xs text-muted-foreground font-medium hover:underline" data-testid="button-clear-all">Clear</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 min-h-0 max-h-[280px] pr-1">
            {filteredPlants.map(plant => {
              const isSelected = selectedIds.has(plant.id);
              return (
                <button
                  key={plant.id}
                  onClick={() => togglePlant(plant.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border",
                    isSelected
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background border-transparent hover:bg-muted/50"
                  )}
                  data-testid={`button-autoplot-plant-${plant.id}`}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-border"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{plant.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="capitalize">{plant.type}</span>
                      <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5" />{plant.water}</span>
                      <span className="flex items-center gap-0.5"><Sun className="w-2.5 h-2.5" />{plant.sunlight}</span>
                      <span>{plant.spacing}" spacing</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {preview && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-2" data-testid="autoplot-preview">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sprout className="w-4 h-4 text-primary" />
                Preview
              </h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{preview.placements.length} plants placed across {new Set(preview.placements.map(p => p.plotIndex)).size} plot(s)</p>
                {preview.unplaced.length > 0 && (
                  <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {preview.unplaced.length} plant(s) couldn't be placed — not enough space
                    {preview.unplaced.map(id => {
                      const p = plantsById.get(id);
                      return p ? ` (${p.name})` : "";
                    }).join("")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Array.from({ length: garden.plotCount || 1 }).map((_, plotIdx) => {
                  const plotPlacements = preview.placements.filter(p => p.plotIndex === plotIdx);
                  const uniquePlants = [...new Set(plotPlacements.map(p => p.plantId))];
                  return (
                    <div key={plotIdx} className="bg-card border border-border rounded-lg px-3 py-2 text-xs min-w-[120px]">
                      <span className="font-semibold text-foreground">Plot {plotIdx + 1}</span>
                      <div className="text-muted-foreground mt-1 space-y-0.5">
                        {uniquePlants.length === 0 ? (
                          <span className="italic">Empty</span>
                        ) : (
                          uniquePlants.map(id => {
                            const p = plantsById.get(id);
                            const count = plotPlacements.filter(pl => pl.plantId === id).length;
                            return p ? <div key={id}>{p.name} ×{count}</div> : null;
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          {!preview ? (
            <Button
              onClick={generatePreview}
              disabled={selectedIds.size === 0}
              className="flex-1"
              data-testid="button-generate-autoplot"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Layout
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setPreview(null)}
                data-testid="button-autoplot-back"
              >
                Back
              </Button>
              <Button
                onClick={applyLayout}
                className="flex-1"
                data-testid="button-apply-autoplot"
              >
                <Check className="w-4 h-4 mr-2" />
                Apply to Garden
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
