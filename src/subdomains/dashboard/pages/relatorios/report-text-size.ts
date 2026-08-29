export type ReportTextSize = "sm" | "md" | "lg" | "xl";

export const REPORT_TEXT_SIZES: ReportTextSize[] = ["sm", "md", "lg", "xl"];

export const REPORT_TEXT_SIZE_CLASSES: Record<
  ReportTextSize,
  {
    root: string;
    brand: string;
    title: string;
    meta: string;
    sectionTitle: string;
    summary: string;
    balance: string;
    table: string;
    tableTotal: string;
    empty: string;
  }
> = {
  sm: {
    root: "text-[15px] px-6 py-8 md:px-8 md:py-9",
    brand: "text-sm",
    title: "text-2xl",
    meta: "text-[15px]",
    sectionTitle: "text-base",
    summary: "text-base",
    balance: "text-lg",
    table: "text-[15px]",
    tableTotal: "text-base",
    empty: "text-[15px]",
  },
  md: {
    root: "text-lg px-8 py-10 md:px-10 md:py-11",
    brand: "text-base",
    title: "text-3xl",
    meta: "text-lg",
    sectionTitle: "text-lg",
    summary: "text-lg",
    balance: "text-xl",
    table: "text-lg",
    tableTotal: "text-xl",
    empty: "text-lg",
  },
  lg: {
    root: "text-xl px-8 py-10 md:px-12 md:py-12",
    brand: "text-base",
    title: "text-4xl",
    meta: "text-xl",
    sectionTitle: "text-xl",
    summary: "text-xl",
    balance: "text-2xl",
    table: "text-xl",
    tableTotal: "text-2xl",
    empty: "text-xl",
  },
  xl: {
    root: "text-2xl px-10 py-12 md:px-14 md:py-14",
    brand: "text-lg",
    title: "text-5xl",
    meta: "text-2xl",
    sectionTitle: "text-2xl",
    summary: "text-2xl",
    balance: "text-3xl",
    table: "text-2xl",
    tableTotal: "text-3xl",
    empty: "text-2xl",
  },
};
