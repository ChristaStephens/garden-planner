import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Planner from "@/pages/Planner";
import Plants from "@/pages/Plants";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/planner/:id" component={Planner} />
      <Route path="/plants" component={Plants} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={base}>
      <TooltipProvider>
        <Toaster />
        <Routes />
      </TooltipProvider>
    </WouterRouter>
  );
}

export default App;
