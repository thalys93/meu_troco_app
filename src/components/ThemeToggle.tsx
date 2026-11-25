
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      disabled={!mounted}
      className={cn(
        'relative h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground',
        className
      )}
      aria-label={t('settings.appearance.themeLabel')}
    >
      {isDark ? (
        <Moon className="h-5 w-5 text-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      )}
      <span className="sr-only">{t('settings.appearance.themeLabel')}</span>
    </Button>
  );
};

export default ThemeToggle;
