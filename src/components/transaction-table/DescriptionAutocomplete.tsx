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
  const suggestions = useTransactionDescriptionSuggestions(transactions, value);
  const items = React.useMemo<SuggestionItem[]>(
    () =>
      suggestions.map((suggestion, index) => ({
        ...suggestion,
        id: `${suggestion.description}-${index}`,
      })),
    [suggestions]
  );
  const shouldShowSuggestions = value.trim().length > 0 && items.length > 0;

  const handleSelect = (suggestion: DescriptionSuggestion) => {
    onChange(suggestion.description);
    onSelectSuggestion(suggestion);
  };

  return (
    <Autocomplete
      value={value}
      onValueChange={onChange}
      items={items}
      mode="none"
      open={shouldShowSuggestions}
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
        onKeyDown={(event) => {
          if (event.key === 'Escape' && shouldShowSuggestions) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      />
      <AutocompleteContent align="start">
        <AutocompleteList>
          {(item: SuggestionItem) => (
            <AutocompleteItem
              key={item.id}
              value={item}
              onClick={() => handleSelect(item)}
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
