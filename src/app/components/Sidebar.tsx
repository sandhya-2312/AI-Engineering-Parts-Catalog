import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Package,
  FileBarChart,
  Layers,
  Settings,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  X,
} from 'lucide-react';
import { cn } from './ui/utils';
import { useSidebar } from './SidebarContext';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Parts Catalog', path: '/catalog', icon: Package },
  { name: 'Export Catalog', path: '/export', icon: FileBarChart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
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
          isMobile ? 'fixed inset-y-0 left-0 w-56 shadow-xl' : 'relative shrink-0',
          isMobile && !isOpen && '-translate-x-full',
          !isMobile && (isCollapsed ? 'w-14' : 'w-56'),
        )}
      >
        <div
          className={cn(
            'border-b border-sidebar-border',
            isCollapsed && !isMobile ? 'p-2.5' : 'p-3 flex items-center justify-between gap-2',
          )}
        >
          {isCollapsed && !isMobile ? (
            <button
              type="button"
              onClick={expandSidebar}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Layers className="w-5 h-5 text-primary" />
              </div>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground truncate">
                    EngineerX
                  </h1>
                  
                </div>
              </div>
              <button
                type="button"
                onClick={handleMenuClick}
                className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors shrink-0"
                aria-label={isMobile ? 'Close menu' : 'Collapse sidebar'}
              >
                {isMobile ? <X className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>

        <nav
          className={cn(
            'flex-1 space-y-1 overflow-y-auto',
            isCollapsed && !isMobile ? 'p-1.5' : 'p-2.5',
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
                  'w-full flex items-center rounded-lg transition-all duration-200 group',
                  isCollapsed && !isMobile ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-primary/20 shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-primary')} />
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
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
            onClick={() => handleNavigate('/')}
            title={isCollapsed && !isMobile ? 'Sign Out' : undefined}
            className={cn(
              'w-full flex items-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200',
              isCollapsed && !isMobile ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(!isCollapsed || isMobile) && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
