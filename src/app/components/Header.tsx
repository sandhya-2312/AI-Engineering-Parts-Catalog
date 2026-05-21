import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Bell, Search } from 'lucide-react';
import { Input } from './ui/input';
import { SidebarMenuButton } from './SidebarContext';
import { ProfileAvatar } from './ProfileAvatar';
import { useProfileDisplay } from '../hooks/useProfileDisplay';
import { cn } from './ui/utils';

export default function Header() {
  const location = useLocation();
  const { displayName, subtitle, photoUrl } = useProfileDisplay();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsScrolled(false);
    const main = document.querySelector('main');
    if (main instanceof HTMLElement && main.scrollTop > 0) {
      setIsScrolled(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        setIsScrolled(target.scrollTop > 0);
      }
    };

    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => document.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  return (
    <header
      className={cn(
        'bg-white sticky top-0 z-50 transition-[border-color,box-shadow] duration-200',
        isScrolled ? 'border-b border-border shadow-sm' : 'border-b border-transparent',
      )}
    >
      <div className="flex items-center justify-between gap-3 px-6 py-3 md:px-8 md:py-3.5">
        <div className="flex items-center gap-2.5 flex-1 max-w-xl min-w-0">
          <SidebarMenuButton />
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search parts, categories, or part numbers..."
              className="h-8 pl-8 text-sm bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="relative p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <Bell className="w-4 h-4 text-foreground" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-border min-w-0">
            <ProfileAvatar size="sm" name={displayName} photoUrl={photoUrl} />
            <div className="min-w-0 max-w-[6.5rem] sm:max-w-[10rem] md:max-w-[14rem]">
              <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
