import { useRef } from "react";
import { Download, Upload, FileDown } from "lucide-react";
import { useGardenStore, type GardenBox } from "@/hooks/use-garden-store";
import { usePlantStore } from "@/hooks/use-plant-store";
import type { Plant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EXPORT_VERSION = 1;

interface ExportData {
  version: number;
  exportedAt: string;
  gardens: GardenBox[];
  customPlants: Plant[];
}

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAllData() {
  const gardens = useGardenStore.getState().gardens;
  const plants = usePlantStore.getState().plants;
  const data: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    gardens,
    customPlants: plants,
  };
  downloadJson(data, `garden-planner-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

export function exportSingleGarden(gardenId: string) {
  const garden = useGardenStore.getState().gardens.find((g) => g.id === gardenId);
  if (!garden) return;
  const allPlants = usePlantStore.getState().plants;
  const usedPlantIds = new Set(
    Object.values(garden.grid).map((cell) => cell.plantId)
  );
  const referencedPlants = allPlants.filter((p) => usedPlantIds.has(p.id));
  const data: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    gardens: [garden],
    customPlants: referencedPlants,
  };
  const safeName = garden.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  downloadJson(data, `garden-${safeName}-${new Date().toISOString().slice(0, 10)}.json`);
}

export function DataManagerButtons() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importGardens = useGardenStore((s) => s.importGardens);
  const importPlants = usePlantStore((s) => s.importPlants);
  const { toast } = useToast();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        if (!raw.version || !Array.isArray(raw.gardens)) {
          throw new Error("Invalid file format");
        }
        const data = raw as ExportData;
        let plantIdMap: Record<number, number> = {};
        if (data.customPlants && data.customPlants.length > 0) {
          plantIdMap = importPlants(data.customPlants);
        }
        if (data.gardens.length > 0) {
          importGardens(data.gardens, plantIdMap);
        }
        toast({
          title: "Import successful",
          description: `Imported ${data.gardens.length} garden(s)${data.customPlants?.length ? ` and ${data.customPlants.length} plant(s)` : ""}.`,
        });
      } catch {
        toast({
          title: "Import failed",
          description: "The selected file is not a valid Garden Planner export.",
          variant: "destructive",
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        onClick={exportAllData}
        data-testid="button-export-all"
      >
        <Download className="w-4 h-4 mr-2" /> Export All
      </Button>
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        data-testid="button-import"
      >
        <Upload className="w-4 h-4 mr-2" /> Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
        data-testid="input-import-file"
      />
    </div>
  );
}

export function ExportGardenButton({ gardenId }: { gardenId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        exportSingleGarden(gardenId);
      }}
      data-testid={`button-export-garden-${gardenId}`}
      aria-label="Export this garden"
    >
      <FileDown className="w-4 h-4" />
    </Button>
  );
}
