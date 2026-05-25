import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from './ui/utils';
import { useSidebar } from './SidebarContext';
import { AppLogo } from './AppLogo';

const baseNavigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Parts Catalog', path: '/catalog', icon: Package },
  { name: 'Settings', path: '/settings', icon: Settings },
] as const;

const adminNavigation = [{ name: 'Members', path: '/members', icon: Users }] as const;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin } = useAuth();
  const navigation = isAdmin ? [...baseNavigation, ...adminNavigation] : [...baseNavigation];
  const { isOpen, isCollapsed, isMobile, closeSidebar, toggleCollapse, expandSidebar } =
    useSidebar();

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleMenuClick = () => {
    if (isMobile) {
      closeSidebar();
    } else {
      toggleCollapse();
    }
  };

  return (
    <>
      {isMobile && isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out z-40',
          isMobile ? 'fixed inset-y-0 left-0 w-52 shadow-xl' : 'relative shrink-0',
          isMobile && !isOpen && '-translate-x-full',
          !isMobile && (isCollapsed ? 'w-14' : 'w-52'),
        )}
      >
        <div
          className={cn(
            'border-b border-sidebar-border shrink-0',
            isCollapsed && !isMobile
              ? 'p-2.5'
              : 'relative flex w-full items-center justify-center px-3 py-4',
          )}
        >
          {isCollapsed && !isMobile ? (
            <button
              type="button"
              onClick={expandSidebar}
              className="w-full flex justify-center items-center p-2 rounded-lg hover:bg-sidebar-item-hover transition-colors"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <AppLogo variant="mark" className="h-8 w-8" />
            </button>
          ) : (
            <>
              <div className="flex w-full items-center justify-center">
                <AppLogo className="h-10" />
              </div>
              {isMobile && (
                <button
                  type="button"
                  onClick={handleMenuClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-item-hover hover:text-sidebar-item-hover-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>

        <nav
          className={cn(
            'flex-1 space-y-1 overflow-y-auto',
            isCollapsed && !isMobile ? 'p-1.5' : 'px-2.5 pt-6 pb-2.5',
          )}
        >
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                title={isCollapsed && !isMobile ? item.name : undefined}
                className={cn(
                  'w-full flex items-center rounded-lg transition-colors duration-200 group',
                  isCollapsed && !isMobile ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-sidebar-item-active text-sidebar-item-active-foreground shadow-md ring-1 ring-sidebar-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-item-hover hover:text-sidebar-item-hover-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-sidebar-item-active-foreground'
                      : 'text-muted-foreground group-hover:text-sidebar-item-hover-foreground',
                  )}
                />
                {(!isCollapsed || isMobile) && (
                  <>
                    <span
                      className={cn(
                        'flex-1 text-left text-xs font-medium transition-colors',
                        isActive
                          ? 'text-sidebar-item-active-foreground'
                          : 'group-hover:text-sidebar-item-hover-foreground',
                      )}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-sidebar-item-active-foreground/90 shrink-0" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div
          className={cn(
            'border-t border-sidebar-border',
            isCollapsed && !isMobile ? 'p-1.5' : 'p-2.5',
          )}
        >
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            title={isCollapsed && !isMobile ? 'Sign Out' : undefined}
            className={cn(
              'w-full flex items-center rounded-lg text-sidebar-foreground hover:bg-brand-maroon/10 hover:text-brand-maroon transition-all duration-200',
              isCollapsed && !isMobile ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
            )}
          >
            <LogOut className="w-4 h-4 shrink-0 text-brand-maroon" />
            {(!isCollapsed || isMobile) && <span className="text-xs">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
