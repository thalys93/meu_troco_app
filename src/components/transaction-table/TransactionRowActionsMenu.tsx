import { Trash, Pen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { EllipsisVertical } from 'lucide-react';
import { deferDropdownMenuAction } from '@/lib/dropdown-menu-action';
type TransactionRowActionsMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  enableContextMenu?: boolean;
};

function DropdownActionItems({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <DropdownMenuItem
        onSelect={(event) => deferDropdownMenuAction(event, onEdit)}
        className="flex flex-row items-center gap-2 cursor-pointer"
      >
        <Pen className="h-4 w-4" />
        {t('transactionList.edit')}
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(event) => deferDropdownMenuAction(event, onDelete)}
        className="flex flex-row items-center gap-2 cursor-pointer"
      >
        <Trash className="h-4 w-4" />
        {t('transactionList.delete')}
      </DropdownMenuItem>
    </>
  );
}

function ContextActionItems({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <ContextMenuItem
        onSelect={(event) => deferDropdownMenuAction(event, onEdit)}
        className="flex flex-row items-center gap-2 cursor-pointer"
      >
        <Pen className="h-4 w-4" />
        {t('transactionList.edit')}
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={(event) => deferDropdownMenuAction(event, onDelete)}
        className="flex flex-row items-center gap-2 cursor-pointer"
      >
        <Trash className="h-4 w-4" />
        {t('transactionList.delete')}
      </ContextMenuItem>
    </>
  );
}

export function TransactionRowActionsDropdown({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

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
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel className="select-none">{t('transactionList.actions')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownActionItems onEdit={onEdit} onDelete={onDelete} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const TransactionRowActionsMenu = ({
  onEdit,
  onDelete,
  children,
  enableContextMenu = true,
}: TransactionRowActionsMenuProps) => {
  const { t } = useTranslation();

  if (!enableContextMenu) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuLabel className="select-none">{t('transactionList.actions')}</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextActionItems onEdit={onEdit} onDelete={onDelete} />
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TransactionRowActionsMenu;
