import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/context/DataContext";
import BottomNav from "@/components/BottomNav";
import TelegramAuth from "@/components/TelegramAuth";
import TasbihPage from "@/pages/TasbihPage";
import GoalsPage from "@/pages/GoalsPage";
import ZikryPage from "@/pages/ZikryPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import QazaCalculatorPage from "@/pages/QazaCalculatorPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TasbihPage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/zikry" component={ZikryPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/qaza-calculator" component={QazaCalculatorPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <TelegramAuth />
          <div className="min-h-screen bg-background">
            <Router />
            <BottomNav />
          </div>
          <Toaster />
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
