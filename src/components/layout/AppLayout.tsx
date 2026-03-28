import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, UserPlus, Users, ShieldCheck, Building2, LogOut, User, Package, History, BarChart3, Car } from "lucide-react";
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
  const isAdmin = user?.role === 'admin';
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r border-slate-800 bg-slate-900 text-slate-100">
        <SidebarHeader className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">AccessGuard</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-3">
          <SidebarGroup>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"} className="h-12 hover:bg-slate-800 transition-colors">
                  <Link to="/" className="flex items-center gap-4 px-4">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-bold text-sm">Vista General</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/register"} className="h-12 hover:bg-slate-800 transition-colors">
                  <Link to="/register" className="flex items-center gap-4 px-4">
                    <UserPlus className="h-5 w-5" />
                    <span className="font-bold text-sm">Registrar Visita</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/parking"} className="h-12 hover:bg-slate-800 transition-colors">
                  <Link to="/parking" className="flex items-center gap-4 px-4">
                    <Car className="h-5 w-5" />
                    <span className="font-bold text-sm">Estacionamiento</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/custody"} className="h-12 hover:bg-slate-800 transition-colors">
                  <Link to="/custody" className="flex items-center gap-4 px-4">
                    <Package className="h-5 w-5" />
                    <span className="font-bold text-sm">Paquetería</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/history"} className="h-12 hover:bg-slate-800 transition-colors">
                  <Link to="/history" className="flex items-center gap-4 px-4">
                    <History className="h-5 w-5" />
                    <span className="font-bold text-sm">Historial</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/residents"} className="h-12 hover:bg-slate-800 transition-colors">
                  <Link to="/residents" className="flex items-center gap-4 px-4">
                    <Users className="h-5 w-5" />
                    <span className="font-bold text-sm">Directorio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <div className="pt-6 pb-2 px-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Administración</p>
                  <div className="mt-2 space-y-1.5">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/analytics"} className="h-11 hover:bg-slate-800">
                        <Link to="/analytics" className="flex items-center gap-4 px-4">
                          <BarChart3 className="h-4 w-4" />
                          <span className="font-bold text-xs uppercase">Estadísticas</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/compliance"} className="h-11 hover:bg-slate-800">
                        <Link to="/compliance" className="flex items-center gap-4 px-4">
                          <Building2 className="h-4 w-4" />
                          <span className="font-bold text-xs uppercase">Legal y Datos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </div>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-4 bg-slate-800/50 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center shadow-inner">
              <User className="h-5 w-5 text-slate-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate leading-none">{user?.fullName}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter mt-1">{user?.role === 'admin' ? 'Administrador' : 'Conserje'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-red-900/20 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </Sidebar>
      <SidebarInset className={cn("bg-slate-50 flex flex-col min-h-screen", className)}>
        <header className="h-16 border-b bg-white flex items-center px-6 gap-4 sticky top-0 z-30">
          <SidebarTrigger />
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">
            {location.pathname === "/" && "Vista General"}
            {location.pathname === "/register" && "Registro Visitantes"}
            {location.pathname === "/residents" && "Directorio Residentes"}
            {location.pathname === "/compliance" && "Legal y Cumplimiento"}
            {location.pathname === "/custody" && "Paquetería y Custodia"}
            {location.pathname === "/analytics" && "Estadísticas y Reportes"}
            {location.pathname === "/history" && "Bitácora Histórica"}
            {location.pathname === "/parking" && "Control Parking"}
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