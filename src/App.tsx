import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { AlertsPage } from "@/pages/AlertsPage";
import { SharePage } from "@/pages/SharePage";
import { ComparePage } from "@/pages/ComparePage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
      refetchOnWindowFocus: true,
    },
  },
});

/** Layout wrapper that renders child routes via Outlet */
function LayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Embed route — standalone, no layout */}
          <Route path="/share/:contractAddress" element={<SharePage />} />

          {/* Main app routes with layout */}
          <Route element={<LayoutRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/share" element={<SharePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
