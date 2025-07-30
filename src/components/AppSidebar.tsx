import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowLeftRight, 
  Receipt,
  Settings,
  LogOut
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { AuthService, type User } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Phòng ban",
    url: "/departments",
    icon: Building2,
  },
  {
    title: "Loại ngân sách",
    url: "/budget-types",
    icon: CreditCard,
  },
  {
    title: "Ngân sách",
    url: "/budgets",
    icon: TrendingUp,
  },
  {
    title: "Loại dòng tiền",
    url: "/cash-flow-types",
    icon: ArrowLeftRight,
  },
  {
    title: "Dòng tiền",
    url: "/cash-flows",
    icon: TrendingUp,
  },
  {
    title: "Giao dịch",
    url: "/transactions",
    icon: Receipt,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const user: User | null = AuthService.getUser();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    AuthService.logout();
    toast({
      title: "Đăng xuất thành công",
      description: "Bạn đã đăng xuất khỏi hệ thống.",
    });
    navigate('/login');
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <div className="bg-primary p-2 rounded-lg">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sm">Cash Flow</h2>
              <p className="text-xs text-muted-foreground">Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        isActive 
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        {user && (
          <div className="p-4 space-y-3">
            {!collapsed && (
              <div className="text-sm">
                <p className="font-medium">{user.fullName}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
                <p className="text-muted-foreground text-xs capitalize">{user.role}</p>
              </div>
            )}
            <Button
              variant="outline"
              size={collapsed ? "icon" : "sm"}
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Đăng xuất</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}