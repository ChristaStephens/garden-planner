import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Search, Sprout, Eraser, MousePointer2, AlertCircle, Leaf, Printer, Sun, Moon, Plus, ChevronDown, ChevronUp, Sparkles, Wand2 } from "lucide-react";
import { useGardenStore } from "@/hooks/use-garden-store";
import { usePlantStore } from "@/hooks/use-plant-store";
import { useTheme } from "@/hooks/use-theme";
import { PlantingGrid } from "@/components/PlantingGrid";
import { PlantCarePanel } from "@/components/PlantCarePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { searchPlantDatabase, type PlantReference } from "@/lib/plant-database";
import { getPlantingSchedule } from "@/lib/planting-schedule";
import { useLocationData } from "@/hooks/use-location";
import { AutoPlotDialog } from "@/components/AutoPlotDialog";

type Tool = "plant" | "erase" | "inspect";

export default function Planner() {
  const { id } = useParams();
  const garden = useGardenStore(state => state.gardens.find(g => g.id === id));
  const { plantInCell, removePlantFromCell, setGardenGrid } = useGardenStore();
  
  const plants = usePlantStore(state => state.plants);
  const addPlant = usePlantStore(state => state.addPlant);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const { zoneData } = useLocationData();
  const plantTimingMap = useMemo(() => {
    if (!zoneData) return {};
    const schedule = getPlantingSchedule(zoneData.lastFrost, plants.map(p => p.name));
    const map: Record<string, { status: string; label: string }> = {};
    for (const s of schedule) {
      map[s.name] = { status: s.status, label: s.statusLabel };
    }
    return map;
  }, [plants, zoneData]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  const [activeTool, setActiveTool] = useState<Tool>("inspect");
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [inspectedPlantId, setInspectedPlantId] = useState<number | null>(null);

  const [showAddPlant, setShowAddPlant] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantType, setNewPlantType] = useState("Vegetable");
  const [newPlantSpacing, setNewPlantSpacing] = useState("12");
  const [newPlantSunlight, setNewPlantSunlight] = useState("Full Sun");
  const [newPlantWater, setNewPlantWater] = useState("");
  const [newPlantFertilizer, setNewPlantFertilizer] = useState("");
  const [newPlantCompanions, setNewPlantCompanions] = useState<string[]>([]);
  const [newPlantIncompatible, setNewPlantIncompatible] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<PlantReference[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlantNameChange = (value: string) => {
    setNewPlantName(value);
    setAutoFilled(false);
    const matches = searchPlantDatabase(value);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSelectSuggestion = (ref: PlantReference) => {
    setNewPlantName(ref.name);
    setNewPlantType(ref.type);
    setNewPlantSpacing(String(ref.spacing));
    setNewPlantSunlight(ref.sunlight);
    setNewPlantWater(ref.water);
    setNewPlantFertilizer(ref.fertilizer);
    setNewPlantCompanions(ref.companionPlants);
    setNewPlantIncompatible(ref.incompatiblePlants);
    setShowSuggestions(false);
    setAutoFilled(true);
  };

  const resetNewPlantForm = () => {
    setNewPlantName("");
    setNewPlantType("Vegetable");
    setNewPlantSpacing("12");
    setNewPlantSunlight("Full Sun");
    setNewPlantWater("");
    setNewPlantFertilizer("");
    setNewPlantCompanions([]);
    setNewPlantIncompatible([]);
    setAutoFilled(false);
    setSuggestions([]);
  };

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;
    const exists = plants.some(p => p.name.toLowerCase() === newPlantName.trim().toLowerCase());
    if (exists) {
      toast({ title: "Plant already exists", description: `"${newPlantName.trim()}" is already in your catalog.`, variant: "destructive" });
      return;
    }
    const created = addPlant({
      name: newPlantName.trim(),
      type: newPlantType,
      spacing: parseInt(newPlantSpacing) || 12,
      sunlight: newPlantSunlight,
      water: newPlantWater || "Moderate",
      fertilizer: newPlantFertilizer || "Balanced",
      companionPlants: newPlantCompanions,
      incompatiblePlants: newPlantIncompatible,
    });
    toast({ title: "Plant added", description: `${created.name} is now available in your catalog.` });
    resetNewPlantForm();
    setShowAddPlant(false);
    handleSelectPlant(created.id);
  };

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

  const handleCellClick = (x: number, y: number, plotIndex: number = 0) => {
    if (activeTool === "plant" && selectedPlantId) {
      const plant = plants.find(p => p.id === selectedPlantId);
      if (plant) {
        plantInCell(garden!.id, x, y, selectedPlantId, plant.spacing, plotIndex);
      }
    } else if (activeTool === "erase") {
      removePlantFromCell(garden!.id, x, y, plotIndex);
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
              {(garden.plotCount || 1) > 1 ? ` · ${garden.plotCount} Plots` : ""}
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
          <AutoPlotDialog
            garden={garden}
            plants={plants}
            onApply={(grid) => {
              setGardenGrid(garden.id, grid);
              toast({ title: "Auto Plot applied!", description: "Your garden has been populated with the selected plants." });
            }}
          >
            <Button
              variant="outline"
              size="sm"
              data-testid="button-auto-plot"
              className="print-hidden"
            >
              <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Auto Plot
            </Button>
          </AutoPlotDialog>
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
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                        plant.type.toLowerCase() === "vegetable" ? "bg-green-500/20 border-green-500/30" :
                        plant.type.toLowerCase() === "herb" ? "bg-amber-400/20 border-amber-400/30" :
                        plant.type.toLowerCase() === "flower" ? "bg-pink-400/20 border-pink-400/30" :
                        plant.type.toLowerCase() === "fruit" ? "bg-orange-400/20 border-orange-400/30" :
                        "bg-primary/20 border-primary/10"
                      )}>
                        <Leaf className={cn("w-5 h-5",
                          plant.type.toLowerCase() === "vegetable" ? "text-green-600 dark:text-green-400" :
                          plant.type.toLowerCase() === "herb" ? "text-amber-500 dark:text-amber-400" :
                          plant.type.toLowerCase() === "flower" ? "text-pink-500 dark:text-pink-400" :
                          plant.type.toLowerCase() === "fruit" ? "text-orange-500 dark:text-orange-400" :
                          isSelected ? "text-primary" : "text-primary/60"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-sm truncate text-foreground">{plant.name}</h4>
                          {plantTimingMap[plant.name] && (
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0",
                              plantTimingMap[plant.name].status === "now" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                              plantTimingMap[plant.name].status === "soon" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                              plantTimingMap[plant.name].status === "past" && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
                              plantTimingMap[plant.name].status === "later" && "bg-muted text-muted-foreground"
                            )}>
                              {plantTimingMap[plant.name].label}
                            </span>
                          )}
                        </div>
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

          <div className="border-t border-border shrink-0 overflow-visible relative">
            <button
              onClick={() => setShowAddPlant(!showAddPlant)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-primary hover:bg-muted/50 transition-colors"
              data-testid="button-toggle-add-plant"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New Plant
              </span>
              {showAddPlant ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            {showAddPlant && (
              <form onSubmit={handleAddPlant} className="px-4 pb-4 space-y-3">
                <div className="relative" ref={suggestionsRef}>
                  <Input
                    placeholder="Start typing a plant name..."
                    value={newPlantName}
                    onChange={(e) => handlePlantNameChange(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    required
                    className={cn("h-8 text-sm pr-8", autoFilled && "border-primary/50 bg-primary/5")}
                    data-testid="input-new-plant-name"
                    autoComplete="off"
                  />
                  {autoFilled && (
                    <Sparkles className="w-3.5 h-3.5 text-primary absolute right-2.5 top-1/2 -translate-y-1/2" />
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {suggestions.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => handleSelectSuggestion(s)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/70 transition-colors flex items-center gap-2 border-b border-border/30 last:border-0"
                          data-testid={`suggestion-${s.name.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <Leaf className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-foreground">{s.name}</span>
                            <span className="text-muted-foreground ml-1.5 text-xs">{s.type} · {s.spacing}" spacing</span>
                          </div>
                          <Sparkles className="w-3 h-3 text-primary/40 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {autoFilled && (
                  <div className="text-xs text-primary flex items-center gap-1.5 -mt-1">
                    <Sparkles className="w-3 h-3" /> Auto-filled from plant database
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newPlantType} onValueChange={setNewPlantType}>
                    <SelectTrigger className="h-8 text-sm" data-testid="select-new-plant-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetable">Vegetable</SelectItem>
                      <SelectItem value="Herb">Herb</SelectItem>
                      <SelectItem value="Flower">Flower</SelectItem>
                      <SelectItem value="Fruit">Fruit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Spacing (in)"
                    type="number"
                    min="1"
                    max="48"
                    value={newPlantSpacing}
                    onChange={(e) => setNewPlantSpacing(e.target.value)}
                    className="h-8 text-sm"
                    data-testid="input-new-plant-spacing"
                  />
                </div>
                <Select value={newPlantSunlight} onValueChange={setNewPlantSunlight}>
                  <SelectTrigger className="h-8 text-sm" data-testid="select-new-plant-sunlight">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Sun">Full Sun</SelectItem>
                    <SelectItem value="Partial Sun">Partial Sun</SelectItem>
                    <SelectItem value="Partial Shade">Partial Shade</SelectItem>
                    <SelectItem value="Full Shade">Full Shade</SelectItem>
                    <SelectItem value="Full to Partial Sun">Full to Partial Sun</SelectItem>
                    <SelectItem value="Full to Partial Shade">Full to Partial Shade</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Water needs (optional)"
                  value={newPlantWater}
                  onChange={(e) => setNewPlantWater(e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-new-plant-water"
                />
                <Input
                  placeholder="Fertilizer (optional)"
                  value={newPlantFertilizer}
                  onChange={(e) => setNewPlantFertilizer(e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-new-plant-fertilizer"
                />
                {(newPlantCompanions.length > 0 || newPlantIncompatible.length > 0) && (
                  <div className="space-y-2 p-2.5 bg-muted/40 rounded-lg border border-border/50">
                    {newPlantCompanions.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">Companions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {newPlantCompanions.map(c => (
                            <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {newPlantIncompatible.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">Avoid planting near:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {newPlantIncompatible.map(c => (
                            <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <Button type="submit" size="sm" className="w-full" data-testid="button-submit-new-plant">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add to Catalog
                </Button>
              </form>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden bg-dot-pattern">
          <div className={cn(
            "flex-1 overflow-auto bg-muted/30 min-h-[500px]",
            (garden.plotCount || 1) > 1
              ? "grid grid-cols-4 auto-rows-min gap-4 p-4 items-start"
              : "flex items-start justify-center p-8"
          )}>
            {Array.from({ length: garden.plotCount || 1 }).map((_, plotIdx) => (
              <PlantingGrid
                key={plotIdx}
                garden={garden}
                plants={plants}
                selectedTool={activeTool}
                selectedPlantId={selectedPlantId}
                onCellClick={handleCellClick}
                onInspect={(plantId) => {
                  setInspectedPlantId(plantId);
                  if (activeTool !== 'erase') setActiveTool('inspect');
                }}
                plotIndex={plotIdx}
                plotLabel={(garden.plotCount || 1) > 1 ? `Plot ${plotIdx + 1}` : undefined}
                compact={(garden.plotCount || 1) > 1}
              />
            ))}
          </div>

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
