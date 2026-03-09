import { useState } from "react";
import { useLocation } from "wouter";
import { Sprout, Ruler, CalendarDays, Grid2X2 } from "lucide-react";
import { useGardenStore } from "@/hooks/use-garden-store";
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
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [width, setWidth] = useState("4");
  const [length, setLength] = useState("8");
  const [season, setSeason] = useState("");
  const [plotCount, setPlotCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(width);
    const l = parseInt(length);
    
    if (name && w > 0 && l > 0) {
      const id = addGarden(name, w, l, season, plotCount);
      setOpen(false);
      setLocation(`/planner/${id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden border-border bg-card">
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
            <div className="grid grid-cols-4 gap-2" data-testid="plot-count-selector">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" data-testid="button-create-plot">
              Create {plotCount > 1 ? `${plotCount} Plots` : "Plot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
