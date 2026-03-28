import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, UserPlus, Users, ShieldCheck, Building2, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r border-slate-800 bg-slate-900 text-slate-100">
        <SidebarHeader className="border-b border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AccessGuard</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"} className="hover:bg-slate-800 transition-colors">
                  <Link to="/" className="flex items-center gap-3 px-3 py-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-medium">Panel Principal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/register"} className="hover:bg-slate-800 transition-colors">
                  <Link to="/register" className="flex items-center gap-3 px-3 py-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="font-medium">Registrar Visita</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/residents"} className="hover:bg-slate-800 transition-colors">
                  <Link to="/residents" className="flex items-center gap-3 px-3 py-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Residentes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/compliance"} className="hover:bg-slate-800 transition-colors">
                  <Link to="/compliance" className="flex items-center gap-3 px-3 py-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Cumplimiento</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <div className="mt-auto p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user?.role === 'admin' ? 'Administrador' : 'Conserje'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </Sidebar>
      <SidebarInset className={cn("bg-slate-50 flex flex-col min-h-screen", className)}>
        <header className="h-16 border-b bg-white flex items-center px-4 gap-4 sticky top-0 z-10">
          <SidebarTrigger />
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-sm font-semibold text-slate-600">
            {location.pathname === "/" && "Vista General"}
            {location.pathname === "/register" && "Registro de Visitantes"}
            {location.pathname === "/residents" && "Directorio de Residentes"}
            {location.pathname === "/compliance" && "Legal y Cumplimiento"}
          </h2>
        </header>
        <main className="flex-1 overflow-auto">
          {container ? (
            <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}