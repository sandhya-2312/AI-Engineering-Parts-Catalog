import { Bell, Search, User } from 'lucide-react';
import { Input } from './ui/input';
import { SidebarMenuButton } from './SidebarContext';

export default function Header() {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xl min-w-0">
          <SidebarMenuButton />
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search parts, categories, or part numbers..."
              className="pl-10 bg-background/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            className="relative p-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-foreground">John Engineer</p>
              <p className="text-xs text-muted-foreground">Senior Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
