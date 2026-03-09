import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Search, Sprout, Eraser, MousePointer2, AlertCircle, Leaf, Printer, Sun, Moon } from "lucide-react";
import { useGardenStore } from "@/hooks/use-garden-store";
import { usePlantStore } from "@/hooks/use-plant-store";
import { useTheme } from "@/hooks/use-theme";
import { PlantingGrid } from "@/components/PlantingGrid";
import { PlantCarePanel } from "@/components/PlantCarePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tool = "plant" | "erase" | "inspect";

export default function Planner() {
  const { id } = useParams();
  const garden = useGardenStore(state => state.gardens.find(g => g.id === id));
  const { plantInCell, removePlantFromCell } = useGardenStore();
  
  const plants = usePlantStore(state => state.plants);
  const { theme, toggleTheme } = useTheme();
  
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [activeTool, setActiveTool] = useState<Tool>("inspect");
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [inspectedPlantId, setInspectedPlantId] = useState<number | null>(null);

  const filteredPlants = useMemo(() => {
    return plants.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || p.type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [plants, search, filterType]);

  const plantTypes = useMemo(() => {
    const types = new Set(plants.map(p => p.type.toLowerCase()));
    return ["all", ...Array.from(types)];
  }, [plants]);

  const handleCellClick = (x: number, y: number) => {
    if (activeTool === "plant" && selectedPlantId) {
      const plant = plants.find(p => p.id === selectedPlantId);
      if (plant) {
        plantInCell(garden!.id, x, y, selectedPlantId, plant.spacing);
      }
    } else if (activeTool === "erase") {
      removePlantFromCell(garden!.id, x, y);
    }
  };

  const handleSelectPlant = (plantId: number) => {
    setSelectedPlantId(plantId);
    setActiveTool("plant");
    setInspectedPlantId(plantId);
  };

  const inspectedPlant = plants.find(p => p.id === inspectedPlantId);

  if (!garden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Garden Not Found</h1>
        <p className="text-muted-foreground mb-6">The garden plot you are looking for doesn't exist or was deleted.</p>
        <Link href="/">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">{garden.name}</h1>
            <p className="text-xs text-muted-foreground">
              {garden.width}ft × {garden.length}ft Grid
              {garden.season ? ` · ${garden.season}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="print-hidden"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-print-garden"
            onClick={() => window.print()}
            className="print-hidden"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
          </Button>
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50 print-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTool("inspect")}
              className={cn("rounded-lg text-xs font-semibold px-3 h-8", activeTool === "inspect" && "bg-background shadow-sm")}
            >
              <MousePointer2 className="w-3.5 h-3.5 mr-1.5" /> Inspect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTool("plant")}
              className={cn("rounded-lg text-xs font-semibold px-3 h-8", activeTool === "plant" && "bg-primary text-primary-foreground shadow-sm hover:text-primary-foreground")}
            >
              <Sprout className="w-3.5 h-3.5 mr-1.5" /> Plant
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTool("erase")}
              className={cn("rounded-lg text-xs font-semibold px-3 h-8", activeTool === "erase" && "bg-destructive text-destructive-foreground shadow-sm hover:text-destructive-foreground")}
            >
              <Eraser className="w-3.5 h-3.5 mr-1.5" /> Erase
            </Button>
          </div>
        </div>
      </header>

      <div className="print-header hidden" style={{ alignItems: "baseline", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{garden.name}</h1>
        <span style={{ fontSize: "0.875rem", color: "#666" }}>{garden.width}ft x {garden.length}ft{garden.season ? ` | ${garden.season}` : ""}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-border bg-card flex flex-col flex-shrink-0 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-border shrink-0">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary" /> Plant Catalog
            </h2>
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search plants..." 
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {plantTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap capitalize transition-colors",
                    filterType === type 
                      ? "bg-secondary text-secondary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredPlants.length === 0 ? (
              <div className="text-center p-6 text-sm text-muted-foreground">
                No plants found matching your search.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPlants.map((plant) => {
                  const isSelected = activeTool === "plant" && selectedPlantId === plant.id;
                  return (
                    <div
                      key={plant.id}
                      onClick={() => handleSelectPlant(plant.id)}
                      className={cn(
                        "p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0 border border-primary/10">
                        <Leaf className={cn("w-5 h-5", isSelected ? "text-primary" : "text-primary/60")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-foreground">{plant.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="capitalize">{plant.type}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{plant.spacing}" space</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden bg-dot-pattern">
          <PlantingGrid 
            garden={garden} 
            plants={plants} 
            selectedTool={activeTool}
            selectedPlantId={selectedPlantId}
            onCellClick={handleCellClick}
            onInspect={(plantId) => {
              setInspectedPlantId(plantId);
              if (activeTool !== 'erase') setActiveTool('inspect');
            }}
          />

          <div className="print-legend hidden" style={{ padding: "1rem 0" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Plant Legend</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {(() => {
                const usedPlantIds = new Set(Object.values(garden.grid).map(cell => cell.plantId));
                return plants
                  .filter(p => usedPlantIds.has(p.id))
                  .map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "hsl(135, 25%, 32%)", opacity: 0.6 + (p.id % 4) * 0.1 }} />
                      <span>{p.name}</span>
                      <span style={{ color: "#999", fontSize: "0.75rem" }}>({p.spacing}" spacing)</span>
                    </div>
                  ));
              })()}
            </div>
          </div>

          {inspectedPlant && (
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex justify-center print-hidden">
              <div className="w-full max-w-2xl pointer-events-auto rounded-2xl overflow-hidden shadow-2xl border border-border/50 animate-in slide-in-from-bottom-8 fade-in duration-300">
                <div className="absolute top-2 right-2 z-20">
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground bg-background/50 backdrop-blur rounded-full hover:bg-background" onClick={() => setInspectedPlantId(null)}>
                     <span className="sr-only">Close</span>
                     <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.50001L3.21846 10.9684C2.99391 11.193 2.99391 11.5571 3.21846 11.7816C3.44301 12.0062 3.80708 12.0062 4.03164 11.7816L7.50005 8.3132L10.9685 11.7816C11.193 12.0062 11.5571 12.0062 11.7816 11.7816C12.0062 11.5571 12.0062 11.193 11.7816 10.9684L8.31322 7.50001L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                   </Button>
                </div>
                <PlantCarePanel plant={inspectedPlant} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
