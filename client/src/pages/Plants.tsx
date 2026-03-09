import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Plus, Leaf, Sun, Moon, Droplets, Beaker, Heart, AlertTriangle, Trash2, Search } from "lucide-react";
import { usePlantStore } from "@/hooks/use-plant-store";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function AddPlantDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Vegetable");
  const [spacing, setSpacing] = useState("12");
  const [sunlight, setSunlight] = useState("Full Sun");
  const [water, setWater] = useState("");
  const [fertilizer, setFertilizer] = useState("");
  const [companions, setCompanions] = useState("");
  const [incompatible, setIncompatible] = useState("");
  const addPlant = usePlantStore(state => state.addPlant);

  const resetForm = () => {
    setName(""); setType("Vegetable"); setSpacing("12");
    setSunlight("Full Sun"); setWater(""); setFertilizer("");
    setCompanions(""); setIncompatible("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlant({
      name,
      type,
      spacing: parseInt(spacing),
      sunlight,
      water,
      fertilizer,
      companionPlants: companions.split(",").map(s => s.trim()).filter(Boolean),
      incompatiblePlants: incompatible.split(",").map(s => s.trim()).filter(Boolean),
    });
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px] rounded-2xl bg-card" aria-describedby="add-plant-description">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <Leaf className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-2xl">Add a New Plant</DialogTitle>
          <DialogDescription id="add-plant-description" className="text-center text-muted-foreground">
            Fill in the details for your plant. It will be added to your catalog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="plant-name">Plant Name</Label>
              <Input id="plant-name" data-testid="input-plant-name" placeholder="e.g. Zucchini" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plant-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="plant-type" data-testid="select-plant-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetable">Vegetable</SelectItem>
                  <SelectItem value="Herb">Herb</SelectItem>
                  <SelectItem value="Flower">Flower</SelectItem>
                  <SelectItem value="Fruit">Fruit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="plant-spacing">Spacing (inches)</Label>
              <Input id="plant-spacing" data-testid="input-plant-spacing" type="number" min="1" max="48" value={spacing} onChange={e => setSpacing(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plant-sunlight">Sunlight</Label>
              <Select value={sunlight} onValueChange={setSunlight}>
                <SelectTrigger id="plant-sunlight" data-testid="select-plant-sunlight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Sun">Full Sun</SelectItem>
                  <SelectItem value="Partial Sun">Partial Sun</SelectItem>
                  <SelectItem value="Partial Shade">Partial Shade</SelectItem>
                  <SelectItem value="Full Shade">Full Shade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="plant-water">Water Needs</Label>
              <Input id="plant-water" data-testid="input-plant-water" placeholder="e.g. 1 inch per week" value={water} onChange={e => setWater(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plant-fertilizer">Fertilizer</Label>
              <Input id="plant-fertilizer" data-testid="input-plant-fertilizer" placeholder="e.g. Balanced organic" value={fertilizer} onChange={e => setFertilizer(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plant-companions">Companion Plants (comma-separated)</Label>
            <Input id="plant-companions" data-testid="input-plant-companions" placeholder="e.g. Tomato, Basil, Pepper" value={companions} onChange={e => setCompanions(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plant-incompatible">Incompatible Plants (comma-separated)</Label>
            <Input id="plant-incompatible" data-testid="input-plant-incompatible" placeholder="e.g. Potato, Fennel" value={incompatible} onChange={e => setIncompatible(e.target.value)} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" data-testid="button-add-plant">
              <Plus className="w-4 h-4 mr-2" />
              Add Plant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Plants() {
  const plants = usePlantStore(state => state.plants);
  const deletePlant = usePlantStore(state => state.deletePlant);
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredPlants = plants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || p.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const types = ["all", ...Array.from(new Set(plants.map(p => p.type.toLowerCase())))];

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0" data-testid="button-back-home" aria-label="Back to dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Plant Catalog</h1>
              <p className="text-sm text-muted-foreground">{plants.length} plants on file</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <AddPlantDialog>
              <Button data-testid="button-new-plant">
                <Plus className="w-4 h-4 mr-2" /> Add Plant
              </Button>
            </AddPlantDialog>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search plants..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-plants"
              aria-label="Search plants"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  filterType === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
                data-testid={`button-filter-${t}`}
                aria-pressed={filterType === t}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filteredPlants.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Leaf className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No plants found</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new plant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlants.map(plant => (
              <article
                key={plant.id}
                className="bg-card border border-border rounded-xl p-5 relative group"
                data-testid={`card-plant-${plant.id}`}
                aria-label={`${plant.name} - ${plant.type}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{plant.name}</h3>
                      <span className="text-xs text-muted-foreground capitalize">{plant.type} &middot; {plant.spacing}" spacing</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                    onClick={() => {
                      if (confirm(`Delete ${plant.name}?`)) deletePlant(plant.id);
                    }}
                    data-testid={`button-delete-plant-${plant.id}`}
                    aria-label={`Delete ${plant.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate text-foreground">{plant.sunlight}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate text-foreground">{plant.water}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Beaker className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate text-foreground">{plant.fertilizer}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {plant.companionPlants.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Heart className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-muted-foreground">{plant.companionPlants.join(", ")}</span>
                    </div>
                  )}
                  {plant.incompatiblePlants.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
                      <span className="text-muted-foreground">{plant.incompatiblePlants.join(", ")}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
