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
import OKRs from '@/pages/OKRs';
import AdminPage from '@/pages/AdminPage';
import ControlPanel from '@/pages/ControlPanel';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/weekly" component={WeeklyTracking} />
      <Route path="/risks" component={RisksPage} />
      <Route path="/audit" component={AuditPlan} />
      <Route path="/team" component={TeamPage} />
      <Route path="/okrs" component={OKRs} />
      <Route path="/control-panel" component={ControlPanel} />
      <Route path="/admin" component={AdminPage} />
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
