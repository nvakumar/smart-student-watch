import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Monitor, Home, Users, FileText, LogIn, UserPlus } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: any }) => (
    <Link to={to}>
      <Button 
        variant={isActive(to) ? "default" : "ghost"} 
        size="sm"
        className="gap-2"
      >
        <Icon className="h-4 w-4" />
        {children}
      </Button>
    </Link>
  );

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Monitor className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground">AI Monitor</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <NavLink to="/" icon={Home}>Home</NavLink>
              <NavLink to="/dashboard" icon={Monitor}>Dashboard</NavLink>
              <NavLink to="/teacher" icon={Users}>Teacher</NavLink>
              <NavLink to="/reports" icon={FileText}>Reports</NavLink>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <NavLink to="/login" icon={LogIn}>Login</NavLink>
            <NavLink to="/register" icon={UserPlus}>Register</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};