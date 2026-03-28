import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, UserPlus, Users, ShieldCheck, Building2, LogOut, User, Package, History, BarChart3, Car, Circle } from "lucide-react";
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
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none">Conserjería</span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-0.5">Digital</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-3">
          <SidebarGroup>
            <SidebarMenu className="gap-1.5">
              {[
                { path: "/", label: "Panel Principal", icon: LayoutDashboard },
                { path: "/register", label: "Nueva Visita", icon: UserPlus },
                { path: "/parking", label: "Parking", icon: Car },
                { path: "/custody", label: "Paquetería", icon: Package },
                { path: "/history", label: "Historial", icon: History },
                { path: "/residents", label: "Directorio", icon: Users },
              ].map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="h-12 hover:bg-slate-800 transition-all duration-200 group"
                  >
                    <Link to={item.path} className="flex items-center gap-4 px-4">
                      <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", location.pathname === item.path ? "text-blue-400" : "text-slate-400")} />
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <div className="pt-8 pb-2 px-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3">Administración</p>
                  <div className="space-y-1.5">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/analytics"} className="h-11 hover:bg-slate-800">
                        <Link to="/analytics" className="flex items-center gap-4 px-4">
                          <BarChart3 className="h-4 w-4 text-indigo-400" />
                          <span className="font-bold text-xs uppercase tracking-wider">Analítica</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === "/compliance"} className="h-11 hover:bg-slate-800">
                        <Link to="/compliance" className="flex items-center gap-4 px-4">
                          <Building2 className="h-4 w-4 text-emerald-400" />
                          <span className="font-bold text-xs uppercase tracking-wider">Cumplimiento</span>
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
          <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center shadow-inner">
              <User className="h-5 w-5 text-slate-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate leading-none">{user?.fullName}</p>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-1.5">
                {user?.role === 'admin' ? 'Administrador' : 'Operador'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 mb-4">
            <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sistema Operativo</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </Sidebar>
      <SidebarInset className={cn("bg-slate-50 flex flex-col min-h-screen", className)}>
        <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-40">
          <SidebarTrigger className="hover:scale-110 transition-transform active:scale-95" />
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-slate-700">
            {location.pathname === "/" && "Tablero de Control"}
            {location.pathname === "/register" && "Gestión de Accesos"}
            {location.pathname === "/residents" && "Directorio de Residentes"}
            {location.pathname === "/compliance" && "Privacidad y Cumplimiento"}
            {location.pathname === "/custody" && "Gestión de Paquetería"}
            {location.pathname === "/analytics" && "Inteligencia de Datos"}
            {location.pathname === "/history" && "Historial de Bitácora"}
            {location.pathname === "/parking" && "Control de Estacionamiento"}
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