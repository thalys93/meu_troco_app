import React from "react";
import {
  getCurrentMonthKey,
  shiftMonthKey,
} from "@/subdomains/dashboard/utils/month-range";

type DashboardLayoutMode = "default" | "notion";

type DashboardPreferencesContextValue = {
  layoutMode: DashboardLayoutMode;
  selectedMonth: string;
  setLayoutMode: (nextMode: DashboardLayoutMode) => void;
  toggleLayoutMode: () => void;
  setSelectedMonth: (monthKey: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  resetCurrentMonth: () => void;
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

  React.useEffect(() => {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode);
  }, [layoutMode]);

  React.useEffect(() => {
    window.localStorage.setItem(MONTH_STORAGE_KEY, selectedMonth);
  }, [selectedMonth]);

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
    }),
    [layoutMode, selectedMonth]
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
