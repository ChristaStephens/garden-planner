import { useState } from "react";
import { useLocation } from "wouter";
import { Sprout, Ruler } from "lucide-react";
import { useGardenStore } from "@/hooks/use-garden-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function CreateGardenDialog({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const addGarden = useGardenStore(state => state.addGarden);
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [width, setWidth] = useState("4");
  const [length, setLength] = useState("8");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(width);
    const l = parseInt(length);
    
    if (name && w > 0 && l > 0) {
      const id = addGarden(name, w, l);
      setOpen(false);
      // Redirect to planner
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
            />
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
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Create Plot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
