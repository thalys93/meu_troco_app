import React from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useUserStore from '@/store/UserStore';
import { useGetUnreadCount } from '@/utils/services/api/notifications-service';
import NotificationList from './notifications-list';
import { cn } from '@/lib/utils';

const NotificationsTrigger = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const uid = useUserStore((s) => s.uid);
  const { data: unreadCount = 0 } = useGetUnreadCount(uid ?? null);
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'relative rounded-full text-muted-foreground hover:bg-muted hover:text-foreground',
            className
          )}
          aria-label={t('notifications.title')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-auto border-border/60 p-0">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsTrigger;
