import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { cn } from './ui/utils';
import { isDesktopViewport } from './sidebar-utils';

const COLLAPSED_STORAGE_KEY = 'engineerx-sidebar-collapsed';

function readCollapsedPreference(): boolean {
  try {
    return sessionStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeCollapsedPreference(collapsed: boolean) {
  try {
    sessionStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  } catch {
    // ignore storage errors
  }
}

type SidebarContextValue = {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapse: () => void;
  expandSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(readCollapsedPreference);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setIsCollapsed(false);
      writeCollapsedPreference(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  const closeSidebar = useCallback(() => setIsOpen(false), []);

  const expandSidebar = useCallback(() => {
    if (isDesktopViewport()) {
      setIsCollapsed(false);
      writeCollapsedPreference(false);
    } else {
      setIsOpen(true);
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    if (!isDesktopViewport()) return;
    setIsCollapsed((prev) => {
      const next = !prev;
      writeCollapsedPreference(next);
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isDesktopViewport()) {
      setIsCollapsed((prev) => {
        const next = !prev;
        writeCollapsedPreference(next);
        return next;
      });
    } else {
      setIsOpen((prev) => !prev);
    }
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        isMobile,
        toggleSidebar,
        closeSidebar,
        toggleCollapse,
        expandSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarMenuButton({ className }: { className?: string }) {
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar();

  const Icon = isMobile ? Menu : isCollapsed ? PanelLeftOpen : PanelLeftClose;
  const label = isMobile
    ? 'Open menu'
    : isCollapsed
      ? 'Expand sidebar'
      : 'Collapse sidebar';

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40',
        className,
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
