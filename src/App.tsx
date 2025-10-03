import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewInquiry from "./pages/NewInquiry";
import Inquiries from "./pages/Inquiries";
import ProductionManager from "./pages/ProductionManager";
import JobcardManagement from "./pages/JobcardManagement";
import WorkshopTracking from "./pages/WorkshopTracking";
import DesignDepartment from "./pages/DesignDepartment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-6 bg-background sticky top-0 z-10">
          <SidebarTrigger />
          <div className="ml-4">
            <h2 className="text-sm font-semibold">Nakshita Jewellers ERP</h2>
          </div>
        </header>
        <main className="flex-1 p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inquiries"
              element={
                <ProtectedRoute requiredRoles={["admin", "sales"]}>
                  <AppLayout>
                    <Inquiries />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobcards"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <JobcardManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshop/:jobcardId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkshopTracking />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/design"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DesignDepartment />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inquiry/new"
              element={
                <ProtectedRoute requiredRoles={["admin", "sales"]}>
                  <AppLayout>
                    <NewInquiry />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/production"
              element={
                <ProtectedRoute requiredRoles={["admin", "production_manager"]}>
                  <AppLayout>
                    <ProductionManager />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
