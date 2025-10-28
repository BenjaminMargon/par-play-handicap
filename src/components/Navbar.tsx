import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target, LogOut, LayoutDashboard, Trophy, Plus } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Fejl",
        description: "Kunne ikke logge ud",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logget ud",
        description: "Du er nu logget ud",
      });
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <span className="hidden sm:inline">Golf Tracker</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            
            <Button
              variant={isActive("/courses") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/courses")}
            >
              <Trophy className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Baner</span>
            </Button>
            
            <Button
              variant={isActive("/add-score") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/add-score")}
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tilføj Score</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
