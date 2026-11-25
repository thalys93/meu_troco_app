import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/use-user';
import AvatarTrigger from '@/components/AvatarTrigger';
import { BuildingOfficeIcon } from '@phosphor-icons/react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  BACKOFFICE_NAV_ITEMS,
  BACKOFFICE_QUICK_LINKS,
  filterBackofficeNav,
  type BackofficeNavItem,
} from '../config/backoffice-nav';

function NavItemLink({ item }: { item: BackofficeNavItem }) {
  const { t } = useTranslation();
  if (!item.href) return null;

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:rounded-full before:bg-primary'
            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{t(item.labelKey)}</span>
    </NavLink>
  );
}

function NavGroupItem({ item }: { item: BackofficeNavItem }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isChildActive = item.children?.some(
    (child) => child.href && (location.pathname === child.href || location.pathname.startsWith(`${child.href}/`)),
  ) ?? false;
  const [open, setOpen] = React.useState(isChildActive);

  React.useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (!item.children?.length) {
    return (
      <SidebarMenuItem>
        <NavItemLink item={item} />
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isChildActive ? 'text-primary' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{t(item.labelKey)}</span>
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.key}>
                <SidebarMenuSubButton asChild isActive={child.href ? location.pathname === child.href : false}>
                  <NavLink to={child.href ?? '#'}>{t(child.labelKey)}</NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

const AppSidebar = () => {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { user, handleLogout } = useUser();
  const { t } = useTranslation();

  const filteredNav = React.useMemo(
    () => filterBackofficeNav(BACKOFFICE_NAV_ITEMS, searchQuery, (key) => t(key)),
    [searchQuery, t]
  );

  const filteredQuickLinks = React.useMemo(
    () => filterBackofficeNav(BACKOFFICE_QUICK_LINKS, searchQuery, (key) => t(key)),
    [searchQuery, t]
  );

  const showQuickLinks = searchQuery.trim().length > 0 && filteredQuickLinks.length > 0;

  return (
    <Sidebar variant="floating" className="bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border shadow-lg">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2">
          <BuildingOfficeIcon className="w-6 h-6 text-primary" aria-hidden />
          <div className="min-w-0">
            <span className="font-bold text-sidebar-foreground block truncate">{t('backoffice.brand')}</span>
            <span className="text-[10px] text-muted-foreground truncate block">{t('backoffice.brandTagline')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('sidebar.searchPlaceholder')}
              className="pl-8 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm"
              aria-label={t('sidebar.searchPlaceholder')}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-3">
            {t('sidebar.mainMenu')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {filteredNav.map((item) => (
              <NavGroupItem key={item.key} item={item} />
            ))}
            {filteredNav.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">{t('sidebar.noResults')}</p>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {showQuickLinks && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-3">
              {t('sidebar.quickLinks')}
            </SidebarGroupLabel>
            <SidebarMenu>
              {filteredQuickLinks.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <NavLink
                    to={item.href ?? '#'}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{t(item.labelKey)}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm outline-none hover:bg-sidebar-accent focus:ring-2 focus:ring-sidebar-ring"
              aria-expanded={open}
              aria-haspopup="true"
            >
              <AvatarTrigger open={open} user={user} canChange={false} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="start" side="top">
            <NavLink
              to="/backoffice/profile"
              className="group w-full"
              onClick={() => setOpen(false)}
            >
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" aria-hidden />
                <span>{t('sidebar.profile')}</span>
              </DropdownMenuItem>
            </NavLink>
            <Separator className="my-1" />
            <NavLink to="/" onClick={handleLogout} className="group w-full">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" aria-hidden />
                <span>{t('sidebar.logout')}</span>
              </DropdownMenuItem>
            </NavLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
