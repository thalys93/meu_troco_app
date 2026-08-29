import * as React from 'react';
import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        sm: 'h-7 px-2 [&~[data-slot=autocomplete-clear]]:end-1.5 [&~[data-slot=autocomplete-trigger]]:end-1.5',
        default:
          'h-8 px-2.5 [&~[data-slot=autocomplete-clear]]:end-1.75 [&~[data-slot=autocomplete-trigger]]:end-1.75',
        lg: 'h-9 px-2.5 [&~[data-slot=autocomplete-clear]]:end-2 [&~[data-slot=autocomplete-trigger]]:end-2',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const Autocomplete = AutocompletePrimitive.Root;

function AutocompleteValue({ ...props }: AutocompletePrimitive.Value.Props) {
  return <AutocompletePrimitive.Value data-slot="autocomplete-value" {...props} />;
}

function AutocompleteInput({
  className,
  size = 'default',
  showClear = false,
  showTrigger = false,
  ...props
}: Omit<AutocompletePrimitive.Input.Props, 'size'> &
  VariantProps<typeof inputVariants> & {
    showClear?: boolean;
    showTrigger?: boolean;
  }) {
  return (
    <div className="relative w-full">
      <AutocompletePrimitive.Input
        data-slot="autocomplete-input"
        data-size={size}
        className={cn(inputVariants({ size }), className)}
        {...props}
      />
      {showTrigger && <AutocompleteTrigger />}
      {showClear && <AutocompleteClear />}
    </div>
  );
}

function AutocompleteStatus({
  className,
  ...props
}: AutocompletePrimitive.Status.Props) {
  return (
    <AutocompletePrimitive.Status
      data-slot="autocomplete-status"
      className={cn(
        'px-2 py-1.5 text-sm text-muted-foreground empty:m-0 empty:p-0',
        className
      )}
      {...props}
    />
  );
}

function AutocompletePortal({ ...props }: AutocompletePrimitive.Portal.Props) {
  return <AutocompletePrimitive.Portal data-slot="autocomplete-portal" {...props} />;
}

function AutocompleteBackdrop({
  ...props
}: AutocompletePrimitive.Backdrop.Props) {
  return (
    <AutocompletePrimitive.Backdrop data-slot="autocomplete-backdrop" {...props} />
  );
}

function AutocompletePositioner({
  className,
  ...props
}: AutocompletePrimitive.Positioner.Props) {
  return (
    <AutocompletePrimitive.Positioner
      data-slot="autocomplete-positioner"
      className={cn('z-50 outline-none', className)}
      {...props}
    />
  );
}

function AutocompleteList({
  className,
  ...props
}: AutocompletePrimitive.List.Props) {
  return (
    <AutocompletePrimitive.List
      data-slot="autocomplete-list"
      className={cn('max-h-64 overflow-y-auto p-1', className)}
      {...props}
    />
  );
}

function AutocompleteCollection({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Collection>) {
  return (
    <AutocompletePrimitive.Collection data-slot="autocomplete-collection" {...props} />
  );
}

function AutocompleteRow({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Row>) {
  return (
    <AutocompletePrimitive.Row
      data-slot="autocomplete-row"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

function AutocompleteItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        'relative flex cursor-default select-none items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-foreground outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        className
      )}
      {...props}
    />
  );
}

export interface AutocompleteContentProps
  extends React.ComponentProps<typeof AutocompletePrimitive.Popup> {
  align?: AutocompletePrimitive.Positioner.Props['align'];
  sideOffset?: AutocompletePrimitive.Positioner.Props['sideOffset'];
  alignOffset?: AutocompletePrimitive.Positioner.Props['alignOffset'];
  side?: AutocompletePrimitive.Positioner.Props['side'];
  anchor?: AutocompletePrimitive.Positioner.Props['anchor'];
  showBackdrop?: boolean;
}

function AutocompleteContent({
  className,
  children,
  showBackdrop = false,
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  side = 'bottom',
  anchor,
  ...props
}: AutocompleteContentProps) {
  return (
    <AutocompletePortal>
      {showBackdrop && <AutocompleteBackdrop />}
      <AutocompletePositioner
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        side={side}
        anchor={anchor}
      >
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-popup"
          className={cn(
            'z-50 flex max-h-64 w-[var(--anchor-width)] min-w-[8rem] origin-[var(--transform-origin)] flex-col overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            className
          )}
          {...props}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePositioner>
    </AutocompletePortal>
  );
}

function AutocompleteGroup({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Group>) {
  return <AutocompletePrimitive.Group data-slot="autocomplete-group" {...props} />;
}

function AutocompleteGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.GroupLabel>) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="autocomplete-group-label"
      className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

function AutocompleteEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Empty>) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={cn(
        'px-2 py-1.5 text-center text-sm text-muted-foreground empty:m-0 empty:p-0',
        className
      )}
      {...props}
    />
  );
}

function AutocompleteClear({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Clear>) {
  return (
    <AutocompletePrimitive.Clear
      data-slot="autocomplete-clear"
      className={cn(
        'absolute end-2 top-1/2 -translate-y-1/2 cursor-pointer opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[disabled]:pointer-events-none',
        className
      )}
      {...props}
    >
      <X className="size-4" />
    </AutocompletePrimitive.Clear>
  );
}

function AutocompleteTrigger({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Trigger>) {
  return (
    <AutocompletePrimitive.Trigger
      data-slot="autocomplete-trigger"
      className={cn(
        'absolute end-2 top-1/2 -translate-y-1/2 cursor-pointer opacity-70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none has-[+[data-slot=autocomplete-clear]]:hidden data-[disabled]:pointer-events-none',
        className
      )}
      {...props}
    >
      <ChevronsUpDown className="size-4" />
    </AutocompletePrimitive.Trigger>
  );
}

function AutocompleteArrow({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Arrow>) {
  return <AutocompletePrimitive.Arrow data-slot="autocomplete-arrow" {...props} />;
}

function AutocompleteSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Separator>) {
  return (
    <AutocompletePrimitive.Separator
      data-slot="autocomplete-separator"
      className={cn('my-1.5 h-px bg-border', className)}
      {...props}
    />
  );
}

export {
  Autocomplete,
  AutocompleteValue,
  AutocompleteTrigger,
  AutocompleteInput,
  AutocompleteStatus,
  AutocompletePortal,
  AutocompleteBackdrop,
  AutocompletePositioner,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteCollection,
  AutocompleteRow,
  AutocompleteItem,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteEmpty,
  AutocompleteClear,
  AutocompleteArrow,
  AutocompleteSeparator,
};
