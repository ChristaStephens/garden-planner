import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, Leaf, Grid2X2, CalendarClock, ArrowRight, Trash2, Ruler, BookOpen, Sun, Moon, Copy, Sprout } from "lucide-react";
import { useGardenStore } from "@/hooks/use-garden-store";
import { usePlantStore } from "@/hooks/use-plant-store";
import { useTheme } from "@/hooks/use-theme";
import { CreateGardenDialog } from "@/components/CreateGardenDialog";
import { LocationWidget } from "@/components/LocationWidget";
import { DataManagerButtons, ExportGardenButton } from "@/components/DataManager";
import { Button } from "@/components/ui/button";

export default function Home() {
  const gardens = useGardenStore(state => state.gardens);
  const deleteGarden = useGardenStore(state => state.deleteGarden);
  const duplicateGarden = useGardenStore(state => state.duplicateGarden);
  const plants = usePlantStore(state => state.plants);
  const { theme, toggleTheme } = useTheme();

  const plantCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const garden of gardens) {
      for (const cell of Object.values(garden.grid)) {
        counts[cell.plantId] = (counts[cell.plantId] || 0) + cell.count;
      }
    }
    return Object.entries(counts)
      .map(([id, count]) => {
        const plant = plants.find(p => p.id === Number(id));
        return plant ? { name: plant.name, count } : null;
      })
      .filter(Boolean) as { name: string; count: number }[];
  }, [gardens, plants]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="relative h-[260px] overflow-hidden flex items-end bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary text-primary-foreground rounded-xl" aria-hidden="true">
                <Leaf className="w-6 h-6" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Garden Planner
              </h1>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  data-testid="button-theme-toggle"
                  aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-xl pl-14">
              Design your perfect raised bed, track companion planting, and plan for the season.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8" role="main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <h2 className="text-2xl font-semibold text-foreground">Your Plots</h2>
              <div className="flex gap-2 flex-wrap">
                <DataManagerButtons />
                <Link href="/plants">
                  <Button variant="secondary" data-testid="link-plants-catalog" aria-label="View plant catalog">
                    <BookOpen className="w-4 h-4 mr-2" /> Plant Catalog
                  </Button>
                </Link>
                <CreateGardenDialog>
                  <Button data-testid="button-new-plot">
                    <Plus className="w-4 h-4 mr-2" /> New Plot
                  </Button>
                </CreateGardenDialog>
              </div>
            </div>

            {gardens.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border-2 border-dashed border-border p-12 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px]"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6" aria-hidden="true">
                  <Grid2X2 className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No garden plots yet</h3>
                <p className="text-muted-foreground max-w-md mb-8">
                  Start by creating a new plot. Define the size of your raised bed or garden area to begin placing plants.
                </p>
                <CreateGardenDialog>
                  <Button size="lg" variant="secondary" data-testid="button-create-first-plot">
                    Create Your First Plot
                  </Button>
                </CreateGardenDialog>
              </motion.div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                role="list"
                aria-label="Garden plots"
              >
                {gardens.map((garden) => {
                  const plantedCount = Object.keys(garden.grid).length;
                  const totalCells = garden.width * garden.length;
                  const percentFilled = Math.round((plantedCount / totalCells) * 100) || 0;

                  return (
                    <motion.div key={garden.id} variants={item} role="listitem">
                      <Link href={`/planner/${garden.id}`}>
                        <div
                          className="group block bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer h-full relative overflow-hidden"
                          data-testid={`card-garden-${garden.id}`}
                          aria-label={`Garden: ${garden.name}, ${garden.width}ft by ${garden.length}ft, ${percentFilled}% full`}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="flex justify-between items-start mb-4 gap-1">
                            <div>
                              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {garden.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                  <Ruler className="w-3.5 h-3.5" />
                                  {garden.width}ft x {garden.length}ft
                                </p>
                                {garden.season && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium" data-testid={`badge-season-${garden.id}`}>
                                    {garden.season}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <ExportGardenButton gardenId={garden.id} />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  duplicateGarden(garden.id);
                                }}
                                data-testid={`button-duplicate-garden-${garden.id}`}
                                aria-label={`Duplicate ${garden.name}`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (confirm("Are you sure you want to delete this garden?")) {
                                    deleteGarden(garden.id);
                                  }
                                }}
                                data-testid={`button-delete-garden-${garden.id}`}
                                aria-label={`Delete ${garden.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="flex justify-between gap-1 text-xs font-semibold mb-2">
                              <span className="text-muted-foreground">Capacity</span>
                              <span className="text-primary">{percentFilled}% Full</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={percentFilled} aria-valuemin={0} aria-valuemax={100}>
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentFilled}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between gap-1 text-sm text-muted-foreground border-t border-border/50 pt-4">
                            <span className="flex items-center gap-1.5">
                              <CalendarClock className="w-4 h-4" />
                              Last updated {new Date(garden.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                              Open <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6" aria-label="Tools and information">
            <LocationWidget />

            {plantCounts.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border" data-testid="plant-count-summary">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Sprout className="w-5 h-5 text-primary" aria-hidden="true" />
                  Plant Summary
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Total plants across all gardens — handy for seed shopping.</p>
                <div className="space-y-2">
                  {plantCounts.sort((a, b) => b.count - a.count).map(({ name, count }) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{name}</span>
                      <span className="text-muted-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded-md">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Leaf className="w-5 h-5 text-primary" aria-hidden="true" />
                Beginner Tips
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground" aria-label="Gardening tips">
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true" />
                  <p>Place taller plants on the north side of your box so they don't shade shorter ones.</p>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true" />
                  <p>Pay attention to companion warnings! Some plants secrete chemicals that stunt others.</p>
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true" />
                  <p>Don't forget spacing. A crowded garden is prone to disease and poor yields.</p>
                </li>
              </ul>
            </div>

            <Link href="/plants">
              <div className="bg-card rounded-2xl p-6 border border-border cursor-pointer hover:border-primary/30 transition-colors group" data-testid="link-manage-plants">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1 group-hover:text-primary transition-colors">
                  <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
                  Manage Plants
                </h3>
                <p className="text-sm text-muted-foreground">View all plants, add custom varieties, and manage your catalog.</p>
              </div>
            </Link>
          </aside>

        </div>
      </main>
    </div>
  );
}
