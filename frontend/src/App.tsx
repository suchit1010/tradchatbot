import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Add your routes here */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 