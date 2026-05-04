import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import KeyGeneration from "./pages/KeyGeneration";
import SM3Hash from "./pages/SM3Hash";
import SignMessage from "./pages/SignMessage";
import VerifySignature from "./pages/VerifySignature";
import OperationHistory from "./pages/OperationHistory";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={Dashboard} />
      <Route path={"/keygen"} component={KeyGeneration} />
      <Route path={"/sm3"} component={SM3Hash} />
      <Route path={"/sign"} component={SignMessage} />
      <Route path={"/verify"} component={VerifySignature} />
      <Route path={"/history"} component={OperationHistory} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
