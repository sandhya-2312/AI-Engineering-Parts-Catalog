import { Link } from 'react-router';
import { Bell, Settings2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { useNotifications } from '../hooks/useNotifications';
import { cn } from './ui/utils';

export default function HeaderNotifications() {
  const { items, unreadCount, isLoading, isRead, markRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative p-1.5 rounded-lg hover:bg-secondary transition-colors"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="w-4 h-4 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[6px] h-1.5 px-0.5 bg-primary rounded-full ring-2 ring-white" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto">
          {isLoading && (
            <p className="px-4 py-6 text-xs text-muted-foreground text-center">Loading…</p>
          )}
          {!isLoading && items.length === 0 && (
            <p className="px-4 py-6 text-xs text-muted-foreground text-center">
              No notifications match your preferences.
            </p>
          )}
          {!isLoading &&
            items.map((item) => {
              const unread = !isRead(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-accent/10 transition-colors',
                    unread && 'bg-primary/5',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {unread && (
                      <span className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className={cn('min-w-0 flex-1', !unread && 'pl-3.5')}>
                      <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">{item.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>

        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs" asChild>
            <Link to="/settings?section=notifications">
              <Settings2 className="w-3.5 h-3.5" />
              Notification settings
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
