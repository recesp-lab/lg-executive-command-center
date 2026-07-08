import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/NotFound';
import { Route, Switch } from 'wouter';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Home from '@/pages/Home';
import WeeklyTracking from '@/pages/WeeklyTracking';
import RisksPage from '@/pages/RisksPage';
import AuditPlan from '@/pages/AuditPlan';
import TeamPage from '@/pages/TeamPage';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/weekly" component={WeeklyTracking} />
      <Route path="/risks" component={RisksPage} />
      <Route path="/audit" component={AuditPlan} />
      <Route path="/team" component={TeamPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
