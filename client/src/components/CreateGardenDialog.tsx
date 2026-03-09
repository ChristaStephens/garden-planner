import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Sprout, Ruler, CalendarDays, Grid2X2, Wand2, Check, X } from "lucide-react";
import { useGardenStore } from "@/hooks/use-garden-store";
import { usePlantStore } from "@/hooks/use-plant-store";
import { autoPlot } from "@/lib/auto-plot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function generateSeasonOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const seasons = ["Spring", "Summer", "Fall", "Winter"];
  const options: string[] = [];
  for (let y = currentYear; y <= currentYear + 2; y++) {
    for (const s of seasons) {
      options.push(`${s} ${y}`);
    }
  }
  return options;
}

export function CreateGardenDialog({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const addGarden = useGardenStore(state => state.addGarden);
  const setGardenGrid = useGardenStore(state => state.setGardenGrid);
  const plants = usePlantStore(state => state.plants);
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [width, setWidth] = useState("4");
  const [length, setLength] = useState("4");
  const [season, setSeason] = useState("");
  const [plotCount, setPlotCount] = useState(1);
  const [autoPopulate, setAutoPopulate] = useState(false);
  const [selectedPlantIds, setSelectedPlantIds] = useState<Set<number>>(new Set());
  const [plantDropdownOpen, setPlantDropdownOpen] = useState(false);

  const togglePlant = (id: number) => {
    setSelectedPlantIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(width);
    const l = parseInt(length);
    
    if (name && w > 0 && l > 0) {
      const id = addGarden(name, w, l, season, plotCount);
      if (id && autoPopulate && selectedPlantIds.size > 0) {
        const result = autoPlot(Array.from(selectedPlantIds), plants, w, l, plotCount);
        setGardenGrid(id, result.grid);
      }
      setOpen(false);
      resetForm();
      setLocation(`/planner/${id}`);
    }
  };

  const resetForm = () => {
    setName(""); setWidth("4"); setLength("4"); setSeason("");
    setPlotCount(1); setAutoPopulate(false); setSelectedPlantIds(new Set());
    setPlantDropdownOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-visible border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pt-8 pb-4 px-6 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <Sprout className="w-6 h-6" />
          </div>
          <DialogTitle className="font-display text-2xl">Start a New Garden</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Define the dimensions of your raised bed or garden plot to begin planning.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Garden Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Back Patio Veggies" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              data-testid="input-garden-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="season" className="text-sm font-semibold flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-muted-foreground" /> Season / Year
            </Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger id="season" data-testid="select-season">
                <SelectValue placeholder="Select season (optional)" />
              </SelectTrigger>
              <SelectContent>
                {generateSeasonOptions().map((opt) => (
                  <SelectItem key={opt} value={opt} data-testid={`select-season-${opt.replace(/\s/g, "-").toLowerCase()}`}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-1">
              <Grid2X2 className="w-3 h-3 text-muted-foreground" /> Number of Plots
            </Label>
            <div className="grid grid-cols-6 gap-2" data-testid="plot-count-selector">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPlotCount(n)}
                  className={cn(
                    "h-10 rounded-lg border-2 text-sm font-semibold transition-all",
                    plotCount === n
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                  )}
                  data-testid={`button-plot-count-${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Each plot is a separate raised bed with its own grid for planting.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-semibold flex items-center gap-1">
                <Ruler className="w-3 h-3 text-muted-foreground" /> Width (ft)
              </Label>
              <Input 
                id="width" 
                type="number" 
                min="1" max="20"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                required
                data-testid="input-garden-width"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length" className="text-sm font-semibold flex items-center gap-1">
                <Ruler className="w-3 h-3 text-muted-foreground" /> Length (ft)
              </Label>
              <Input 
                id="length" 
                type="number" 
                min="1" max="50"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                required
                data-testid="input-garden-length"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setAutoPopulate(!autoPopulate);
                if (autoPopulate) { setSelectedPlantIds(new Set()); setPlantDropdownOpen(false); }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left",
                autoPopulate
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
              data-testid="button-auto-populate-toggle"
            >
              <div className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                autoPopulate ? "bg-primary border-primary" : "border-muted-foreground/40"
              )}>
                {autoPopulate && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-primary" /> Auto Populate
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Automatically arrange selected plants into your plots
                </span>
              </div>
            </button>

            {autoPopulate && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Select Plants</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlantIds(new Set(plants.map(p => p.id)))}
                      className="text-xs text-primary font-medium hover:underline"
                      data-testid="button-select-all-plants"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlantIds(new Set())}
                      className="text-xs text-muted-foreground font-medium hover:underline"
                      data-testid="button-clear-plants"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="border border-border rounded-xl max-h-[200px] overflow-y-auto bg-background">
                  {plants.map(plant => {
                    const isSelected = selectedPlantIds.has(plant.id);
                    return (
                      <button
                        key={plant.id}
                        type="button"
                        onClick={() => togglePlant(plant.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors border-b border-border/30 last:border-0",
                          isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                        )}
                        data-testid={`button-select-plant-${plant.id}`}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                          isSelected ? "bg-primary border-primary" : "border-border"
                        )}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </div>
                        <span className="text-sm text-foreground font-medium flex-1">{plant.name}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">{plant.type}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedPlantIds.size > 0 && (
                  <p className="text-xs text-primary font-medium">
                    {selectedPlantIds.size} plant{selectedPlantIds.size !== 1 ? "s" : ""} will be auto-arranged across {plotCount} plot{plotCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" data-testid="button-create-plot">
              {autoPopulate && selectedPlantIds.size > 0 ? (
                <><Wand2 className="w-4 h-4 mr-2" /> Create & Auto Populate</>
              ) : (
                <>Create {plotCount > 1 ? `${plotCount} Plots` : "Plot"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
