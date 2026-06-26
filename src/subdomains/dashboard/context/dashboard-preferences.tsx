import React from "react";
import {
  getCurrentMonthKey,
  shiftMonthKey,
} from "@/subdomains/dashboard/utils/month-range";

type DashboardLayoutMode = "default" | "notion";

export type TransactionSortOrder = "desc" | "asc";

export type TransactionTableSortColumn =
  | "date"
  | "description"
  | "wallet"
  | "category"
  | "type"
  | "paid"
  | "value";

/** @deprecated use TransactionSortOrder */
export type TransactionDateSortOrder = TransactionSortOrder;

/** Filtros da lista de transações (persistidos em localStorage). */
export type TransactionListFiltersPreference = {
  card: string;
  categories: string[];
  type: string;
  minValue: string;
  maxValue: string;
  startDate: string;
  endDate: string;
  dateRangeLockedToMonth: boolean;
  tableSortColumn: TransactionTableSortColumn;
  tableSortOrder: TransactionSortOrder;
};

export const defaultTransactionListFiltersPreference: TransactionListFiltersPreference =
  {
    card: "Todos",
    categories: ["Todos"],
    type: "Todos",
    minValue: "",
    maxValue: "",
    startDate: "",
    endDate: "",
    dateRangeLockedToMonth: true,
    tableSortColumn: "date",
    tableSortOrder: "desc",
  };

const FILTERS_STORAGE_KEY = "dashboard-transaction-list-filters";

const TABLE_SORT_COLUMNS: TransactionTableSortColumn[] = [
  "date",
  "description",
  "wallet",
  "category",
  "type",
  "paid",
  "value",
];

function parseStoredTransactionListFilters(): TransactionListFiltersPreference {
  if (typeof window === "undefined") {
    return defaultTransactionListFiltersPreference;
  }
  try {
    const raw = window.localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return defaultTransactionListFiltersPreference;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return defaultTransactionListFiltersPreference;
    }
    const o = parsed as Record<string, unknown>;
    const d = defaultTransactionListFiltersPreference;
    return {
      card: typeof o.card === "string" ? o.card : d.card,
      categories:
        Array.isArray(o.categories) &&
        o.categories.every((x) => typeof x === "string")
          ? (o.categories as string[])
          : d.categories,
      type: typeof o.type === "string" ? o.type : d.type,
      minValue: typeof o.minValue === "string" ? o.minValue : d.minValue,
      maxValue: typeof o.maxValue === "string" ? o.maxValue : d.maxValue,
      startDate: typeof o.startDate === "string" ? o.startDate : d.startDate,
      endDate: typeof o.endDate === "string" ? o.endDate : d.endDate,
      dateRangeLockedToMonth:
        typeof o.dateRangeLockedToMonth === "boolean"
          ? o.dateRangeLockedToMonth
          : d.dateRangeLockedToMonth,
      tableSortColumn: TABLE_SORT_COLUMNS.includes(o.tableSortColumn as TransactionTableSortColumn)
        ? (o.tableSortColumn as TransactionTableSortColumn)
        : d.tableSortColumn,
      tableSortOrder:
        o.tableSortOrder === "asc" || o.tableSortOrder === "desc"
          ? o.tableSortOrder
          : o.dateSortOrder === "asc" || o.dateSortOrder === "desc"
            ? o.dateSortOrder
            : d.tableSortOrder,
    };
  } catch {
    return defaultTransactionListFiltersPreference;
  }
}

type DashboardPreferencesContextValue = {
  layoutMode: DashboardLayoutMode;
  selectedMonth: string;
  setLayoutMode: (nextMode: DashboardLayoutMode) => void;
  toggleLayoutMode: () => void;
  setSelectedMonth: (monthKey: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  resetCurrentMonth: () => void;
  transactionListFilters: TransactionListFiltersPreference;
  setTransactionListFilters: React.Dispatch<
    React.SetStateAction<TransactionListFiltersPreference>
  >;
};

const LAYOUT_STORAGE_KEY = "dashboard-layout-mode";
const MONTH_STORAGE_KEY = "dashboard-selected-month";

const DashboardPreferencesContext =
  React.createContext<DashboardPreferencesContextValue | null>(null);

const getInitialLayoutMode = (): DashboardLayoutMode => {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
  return stored === "notion" ? "notion" : "default";
};

const getInitialMonth = () => {
  if (typeof window === "undefined") return getCurrentMonthKey();
  const stored = window.localStorage.getItem(MONTH_STORAGE_KEY);
  return stored || getCurrentMonthKey();
};

export function DashboardPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [layoutMode, setLayoutMode] =
    React.useState<DashboardLayoutMode>(getInitialLayoutMode);
  const [selectedMonth, setSelectedMonth] =
    React.useState<string>(getInitialMonth);
  const [transactionListFilters, setTransactionListFilters] =
    React.useState<TransactionListFiltersPreference>(
      parseStoredTransactionListFilters
    );

  React.useEffect(() => {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode);
  }, [layoutMode]);

  React.useEffect(() => {
    window.localStorage.setItem(MONTH_STORAGE_KEY, selectedMonth);
  }, [selectedMonth]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify(transactionListFilters)
      );
    } catch {
      /* ignore quota / private mode */
    }
  }, [transactionListFilters]);

  const value = React.useMemo<DashboardPreferencesContextValue>(
    () => ({
      layoutMode,
      selectedMonth,
      setLayoutMode,
      toggleLayoutMode: () => {
        setLayoutMode((prev) => (prev === "default" ? "notion" : "default"));
      },
      setSelectedMonth,
      goToPreviousMonth: () =>
        setSelectedMonth((prev) => shiftMonthKey(prev, -1)),
      goToNextMonth: () => setSelectedMonth((prev) => shiftMonthKey(prev, 1)),
      resetCurrentMonth: () => setSelectedMonth(getCurrentMonthKey()),
      transactionListFilters,
      setTransactionListFilters,
    }),
    [layoutMode, selectedMonth, transactionListFilters]
  );

  return (
    <DashboardPreferencesContext.Provider value={value}>
      {children}
    </DashboardPreferencesContext.Provider>
  );
}

export const useDashboardPreferences = () => {
  const context = React.useContext(DashboardPreferencesContext);
  if (!context) {
    throw new Error(
      "useDashboardPreferences must be used within DashboardPreferencesProvider"
    );
  }
  return context;
};
