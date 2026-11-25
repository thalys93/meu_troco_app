import React from 'react';
import { EllipsisVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { deferDropdownMenuAction } from '@/lib/dropdown-menu-action';

export type ActionMenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type EntityActionsDropdownProps = {
  items: ActionMenuItem[];
  menuLabel?: string;
  align?: 'start' | 'center' | 'end';
};

type EntityActionsMenuProps = {
  children: React.ReactNode;
  items: ActionMenuItem[];
  menuLabel?: string;
  enableContextMenu?: boolean;
};

function DropdownActionItems({ items }: { items: ActionMenuItem[] }) {
  return (
    <>
      {items.map((item) => (
        <DropdownMenuItem
          key={item.id}
          disabled={item.disabled}
          onSelect={(event) => deferDropdownMenuAction(event, item.onSelect)}
          className={cn(
            'flex flex-row items-center gap-2 cursor-pointer',
            item.destructive && 'text-destructive focus:text-destructive'
          )}
        >
          {item.icon}
          {item.label}
        </DropdownMenuItem>
      ))}
    </>
  );
}

function ContextActionItems({ items }: { items: ActionMenuItem[] }) {
  return (
    <>
      {items.map((item) => (
        <ContextMenuItem
          key={item.id}
          disabled={item.disabled}
          onSelect={(event) => deferDropdownMenuAction(event, item.onSelect)}
          className={cn(
            'flex flex-row items-center gap-2 cursor-pointer',
            item.destructive && 'text-destructive focus:text-destructive'
          )}
        >
          {item.icon}
          {item.label}
        </ContextMenuItem>
      ))}
    </>
  );
}

export function EntityActionsDropdown({
  items,
  menuLabel,
  align = 'end',
}: EntityActionsDropdownProps) {
  if (!items.length) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(e) => e.stopPropagation()}>
        {menuLabel && (
          <>
            <DropdownMenuLabel className="select-none">{menuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownActionItems items={items} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EntityActionsMenu({
  children,
  items,
  menuLabel,
  enableContextMenu = true,
}: EntityActionsMenuProps) {
  if (!enableContextMenu || !items.length) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {menuLabel && (
          <>
            <ContextMenuLabel className="select-none">{menuLabel}</ContextMenuLabel>
            <ContextMenuSeparator />
          </>
        )}
        <ContextActionItems items={items} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
