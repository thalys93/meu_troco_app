import React from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
  DescriptionSuggestion,
  useTransactionDescriptionSuggestions,
} from '@/hooks/use-transaction-description-suggestions';
import { Transaction } from '@/utils/services/api/transation';

type DescriptionAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (suggestion: DescriptionSuggestion) => void;
  transactions: Transaction[];
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
};

const DescriptionAutocomplete = ({
  value,
  onChange,
  onSelectSuggestion,
  transactions,
  disabled,
  hasError,
  autoFocus,
  placeholder,
  className,
}: DescriptionAutocompleteProps) => {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestions = useTransactionDescriptionSuggestions(transactions, value);

  const showSuggestions = open && suggestions.length > 0 && value.trim().length > 0;

  const handleSelect = (suggestion: DescriptionSuggestion) => {
    onChange(suggestion.description);
    onSelectSuggestion(suggestion);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <Popover open={showSuggestions} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor asChild>
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={cn(
            'flex h-8 w-full min-w-0 rounded-md border border-border/60 bg-background/80 px-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-red-500 ring-1 ring-red-500/30',
            className
          )}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && suggestions.length > 0) {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }
            if (e.key === 'Escape' && open) {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={`${suggestion.description}-${suggestion.count}`}
                  value={suggestion.description}
                  onSelect={() => handleSelect(suggestion)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="cursor-pointer text-sm"
                >
                  <span className="truncate">{suggestion.description}</span>
                  <span className="ml-auto pl-2 text-xs text-muted-foreground tabular-nums">
                    {suggestion.count}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DescriptionAutocomplete;
