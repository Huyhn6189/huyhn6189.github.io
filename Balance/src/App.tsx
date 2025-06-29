import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SupabaseProvider } from "./context/SupabaseContext";
import { useAuth } from "./hooks/useAuth"; // Import useAuth
import AuthForm from "./components/AuthForm"; // Import AuthForm
import { Button } from "./components/ui/button"; // Import Button for logout
import { supabase } from "./lib/supabase"; // Import supabase client for logout
import { LogOut } from "lucide-react"; // Import LogOut icon

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth(); // Use the auth hook

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Đang tải...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SupabaseProvider>
          <BrowserRouter>
            {user ? (
              <>
                <div className="absolute top-4 right-4 z-50">
                  <Button variant="outline" size="sm" onClick={async () => {
                    await supabase.auth.signOut();
                  }}>
                    <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                  </Button>
                </div>
                <Routes>
                  <Route path="/" element={<Index user={user} />} /> {/* Pass user to Index */}
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </>
            ) : (
              <AuthForm />
            )}
          </BrowserRouter>
        </SupabaseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;