import { Droplets, Sun, Beaker, Heart, AlertTriangle } from "lucide-react";
import type { Plant } from "@/lib/types";

interface PlantCarePanelProps {
  plant: Plant;
}

export function PlantCarePanel({ plant }: PlantCarePanelProps) {
  return (
    <div className="bg-card border-t border-border p-5 flex-shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10 relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-2xl font-bold text-foreground">{plant.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold capitalize tracking-wide">
              {plant.type}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Spacing: {plant.spacing}" apart ({Math.max(1, Math.floor(144/(plant.spacing*plant.spacing)))} per sq ft)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-background rounded-xl p-3 border border-border/50 flex flex-col gap-1.5">
          <div className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Sun className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Light
          </div>
          <span className="text-sm font-medium">{plant.sunlight}</span>
        </div>
        <div className="bg-background rounded-xl p-3 border border-border/50 flex flex-col gap-1.5">
          <div className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Droplets className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Water
          </div>
          <span className="text-sm font-medium">{plant.water}</span>
        </div>
        <div className="bg-background rounded-xl p-3 border border-border/50 flex flex-col gap-1.5">
          <div className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Beaker className="w-3.5 h-3.5 mr-1.5 text-purple-500" /> Feed
          </div>
          <span className="text-sm font-medium">{plant.fertilizer}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {plant.companionPlants.length > 0 && (
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
              <Heart className="w-3.5 h-3.5" /> Good Companions
            </h4>
            <div className="flex flex-wrap gap-1">
              {plant.companionPlants.map(c => (
                <span key={c} className="text-xs px-2 py-1 bg-white border border-primary/20 rounded-md text-foreground">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {plant.incompatiblePlants.length > 0 && (
          <div className="bg-destructive/5 rounded-xl p-3 border border-destructive/10">
            <h4 className="text-xs font-semibold text-destructive flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Incompatible
            </h4>
            <div className="flex flex-wrap gap-1">
              {plant.incompatiblePlants.map(c => (
                <span key={c} className="text-xs px-2 py-1 bg-white border border-destructive/20 rounded-md text-foreground">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
