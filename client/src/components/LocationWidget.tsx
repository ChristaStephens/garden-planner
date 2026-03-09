import { useState, useEffect } from "react";
import { MapPin, ThermometerSnowflake, Sun, Search, Loader2 } from "lucide-react";
import { useLocation, dispatchLocationChange } from "@/hooks/use-location";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LocationWidget() {
  const [cityInput, setCityInput] = useState(() => localStorage.getItem("garden-city") || "");
  const [stateInput, setStateInput] = useState(() => localStorage.getItem("garden-state") || "");
  
  const [searchParams, setSearchParams] = useState({ 
    city: cityInput, 
    state: stateInput 
  });

  const { data: locationData, isLoading, error } = useLocation(searchParams);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput && stateInput) {
      localStorage.setItem("garden-city", cityInput);
      localStorage.setItem("garden-state", stateInput);
      setSearchParams({ city: cityInput, state: stateInput });
      dispatchLocationChange();
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Growing Zone</h2>
          <p className="text-muted-foreground text-sm">Find your frost dates to know when to plant.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input 
          placeholder="City" 
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          className="flex-1 bg-background"
        />
        <Input 
          placeholder="State (e.g. CA)" 
          value={stateInput}
          onChange={(e) => setStateInput(e.target.value)}
          className="w-24 bg-background"
          maxLength={2}
        />
        <Button type="submit" size="icon" variant="secondary" className="shrink-0" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </form>

      {error ? (
        <div className="p-4 bg-destructive/10 text-destructive-foreground rounded-xl text-sm border border-destructive/20 text-center">
          <span className="text-destructive font-semibold">Couldn't find location.</span><br/>
          Please check your spelling and try again.
        </div>
      ) : locationData ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-background border border-border/50 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-colors">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Hardiness Zone</span>
            <span className="font-display text-3xl text-primary">{locationData.zone}</span>
          </div>
          
          <div className="p-4 rounded-xl bg-background border border-border/50 flex flex-col gap-3 justify-center group hover:border-secondary/30 transition-colors">
            <div className="flex items-center gap-2 text-sm">
              <ThermometerSnowflake className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground font-medium">Last Spring Frost</div>
                <div className="font-semibold text-foreground">{locationData.lastFrost}</div>
              </div>
            </div>
            <div className="w-full h-px bg-border/50" />
            <div className="flex items-center gap-2 text-sm">
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground font-medium">First Fall Frost</div>
                <div className="font-semibold text-foreground">{locationData.firstFrost}</div>
              </div>
            </div>
          </div>
          
          {locationData.notes && (
            <div className="col-span-2 text-xs text-center text-muted-foreground mt-2 italic">
              * {locationData.notes}
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 border-2 border-dashed border-border/60 rounded-xl text-center text-muted-foreground text-sm">
          Enter your location above to get localized growing advice.
        </div>
      )}
    </div>
  );
}
