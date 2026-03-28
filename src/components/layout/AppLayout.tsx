import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, UserPlus, Users, ShieldCheck, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const location = useLocation();
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
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/register"} className="hover:bg-slate-800 transition-colors">
                  <Link to="/register" className="flex items-center gap-3 px-3 py-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="font-medium">Register Visit</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/residents"} className="hover:bg-slate-800 transition-colors">
                  <Link to="/residents" className="flex items-center gap-3 px-3 py-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Residents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/compliance"} className="hover:bg-slate-800 transition-colors">
                  <Link to="/compliance" className="flex items-center gap-3 px-3 py-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Compliance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <div className="mt-auto p-4 border-t border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Security Level: Enterprise</p>
        </div>
      </Sidebar>
      <SidebarInset className={cn("bg-slate-50 flex flex-col min-h-screen", className)}>
        <header className="h-16 border-b bg-white flex items-center px-4 gap-4 sticky top-0 z-10">
          <SidebarTrigger />
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-sm font-semibold text-slate-600">
            {location.pathname === "/" && "Overview"}
            {location.pathname === "/register" && "Visitor Registration"}
            {location.pathname === "/residents" && "Residents Directory"}
            {location.pathname === "/compliance" && "Legal & Compliance"}
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