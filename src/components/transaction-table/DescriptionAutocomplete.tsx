import React from 'react';
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from '@/components/ui/autocomplete';
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

type SuggestionItem = DescriptionSuggestion & { id: string };

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
  const [listOpen, setListOpen] = React.useState(false);
  const suggestions = useTransactionDescriptionSuggestions(transactions, value);
  const items = React.useMemo<SuggestionItem[]>(
    () =>
      suggestions.map((suggestion, index) => ({
        ...suggestion,
        id: `${suggestion.description}-${index}`,
      })),
    [suggestions]
  );
  const canShowList = value.trim().length > 0 && items.length > 0;
  const isOpen = listOpen && canShowList;

  const handleValueChange = (
    next: string,
    eventDetails?: { reason?: string }
  ) => {
    onChange(next);

    if (eventDetails?.reason === 'item-press') {
      const match = items.find((item) => item.description === next);
      if (match) {
        onSelectSuggestion(match);
      }
      setListOpen(false);
      return;
    }

    if (next.trim().length === 0) {
      setListOpen(false);
      return;
    }

    setListOpen(true);
  };

  return (
    <Autocomplete
      value={value}
      onValueChange={handleValueChange}
      items={items}
      mode="none"
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setListOpen(false);
          return;
        }
        if (canShowList) {
          setListOpen(true);
        }
      }}
      itemToStringValue={(item) => item.description}
    >
      <AutocompleteInput
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={cn(
          'min-w-0 border-border/60 bg-background/80 shadow-sm focus-visible:ring-1',
          hasError && 'border-red-500 ring-1 ring-red-500/30',
          className
        )}
        onFocus={() => {
          if (canShowList) {
            setListOpen(true);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => setListOpen(false), 150);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            event.stopPropagation();
            setListOpen(false);
          }
        }}
      />
      <AutocompleteContent align="start">
        <AutocompleteList>
          {(item: SuggestionItem) => (
            <AutocompleteItem
              key={item.id}
              value={item}
              onMouseDown={(event) => event.preventDefault()}
            >
              <span className="truncate">{item.description}</span>
              <span className="ml-auto pl-2 text-xs tabular-nums text-muted-foreground">
                {item.count}
              </span>
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
};

export default DescriptionAutocomplete;
