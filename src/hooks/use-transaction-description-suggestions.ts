import { useMemo } from 'react';
import { Transaction, type TransactionType } from '@/utils/services/api/transation';
import { parseLocalDateInput } from '@/subdomains/dashboard/utils/month-range';

export type DescriptionSuggestion = {
  description: string;
  count: number;
  category: string;
  walletId: string;
  type: TransactionType;
};

const MAX_SUGGESTIONS = 8;

function normalizeDescription(value: string): string {
  return value.trim().toLowerCase();
}

function dateMs(dateString: string): number {
  const d = parseLocalDateInput(dateString);
  const ms = d.getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function buildSuggestionIndex(transactions: Transaction[]): Map<string, DescriptionSuggestion> {
  const index = new Map<string, { suggestion: DescriptionSuggestion; latestMs: number }>();

  for (const tr of transactions) {
    const desc = tr.description?.trim();
    if (!desc) continue;

    const key = normalizeDescription(desc);
    const ms = dateMs(tr.date);
    const walletId = tr.walletId?.trim() || tr.cardId?.trim() || '';

    const existing = index.get(key);
    if (!existing) {
      index.set(key, {
        suggestion: {
          description: desc,
          count: 1,
          category: tr.category ?? '',
          walletId,
          type: tr.type,
        },
        latestMs: ms,
      });
      continue;
    }

    existing.suggestion.count += 1;
    if (ms >= existing.latestMs) {
      existing.latestMs = ms;
      existing.suggestion.category = tr.category ?? existing.suggestion.category;
      existing.suggestion.walletId = walletId || existing.suggestion.walletId;
      existing.suggestion.type = tr.type;
      if (desc.length >= existing.suggestion.description.length) {
        existing.suggestion.description = desc;
      }
    }
  }

  const result = new Map<string, DescriptionSuggestion>();
  index.forEach((entry, key) => {
    result.set(key, entry.suggestion);
  });
  return result;
}

export function useTransactionDescriptionSuggestions(
  transactions: Transaction[],
  query: string
): DescriptionSuggestion[] {
  const index = useMemo(
    () => buildSuggestionIndex(transactions),
    [transactions]
  );

  return useMemo(() => {
    const normalizedQuery = normalizeDescription(query);
    const all = Array.from(index.values());

    const filtered = normalizedQuery
      ? all.filter((s) => normalizeDescription(s.description).includes(normalizedQuery))
      : all;

    return filtered
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.description.localeCompare(b.description, undefined, { sensitivity: 'base' });
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [index, query]);
}
