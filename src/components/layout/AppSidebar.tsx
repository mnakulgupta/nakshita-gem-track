import { NavLink } from "react-router-dom";
import { FileText, LayoutDashboard, Settings, LogOut, Gem, Package, PlusCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["admin", "sales", "production_manager"],
  },
  {
    title: "All Inquiries",
    url: "/inquiries",
    icon: Package,
    roles: ["admin", "sales"],
  },
  {
    title: "New Inquiry",
    url: "/inquiry/new",
    icon: PlusCircle,
    roles: ["admin", "sales"],
  },
  {
    title: "Production Manager",
    url: "/production",
    icon: Settings,
    roles: ["admin", "production_manager"],
  },
];

export function AppSidebar() {
  const { userRole, signOut } = useAuth();

  const filteredItems = navigationItems.filter((item) =>
    item.roles.includes(userRole || "")
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
            <Gem className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Nakshita</span>
            <span className="text-xs text-sidebar-foreground/70">Jewellers ERP</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
