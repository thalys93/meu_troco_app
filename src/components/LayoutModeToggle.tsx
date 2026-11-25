import React from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useDashboardPreferences } from '@/subdomains/dashboard/context/dashboard-preferences';

const LayoutModeToggle = ({ className }: { className?: string }) => {
  const { layoutMode, toggleLayoutMode } = useDashboardPreferences();
  const { t } = useTranslation();
  const isDesktopTable = layoutMode === 'notion';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'rounded-full text-muted-foreground hover:bg-muted hover:text-foreground',
        className
      )}
      onClick={toggleLayoutMode}
      aria-label={t('settings.appearance.layoutLabel')}
      title={
        isDesktopTable
          ? t('settings.appearance.layoutDesktop')
          : t('settings.appearance.layoutMobile')
      }
    >
      {isDesktopTable ? (
        <PanelRightClose className="h-5 w-5 text-muted-foreground" />
      ) : (
        <PanelRightOpen className="h-5 w-5 text-muted-foreground" />
      )}
    </Button>
  );
};

export default LayoutModeToggle;
