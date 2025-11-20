import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import WikiLayout from "./components/WikiLayout";
import AllTopicsHome from "./pages/AllTopicsHome";
import TopicHome from "./pages/TopicHome";
import WikiArticle from "./pages/WikiArticle";

function Router() {
  return (
    <WikiLayout>
      <Switch>
        <Route path="/" component={AllTopicsHome} />
        <Route path="/topics/:topicId" component={TopicHome} />
        <Route path="/topics/:topicId/wiki/:id" component={WikiArticle} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WikiLayout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

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
