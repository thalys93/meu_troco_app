import { Transaction } from "@/utils/services/api/transation";
import {
  isBillPaid,
  isBillPending,
  isBillSkipped,
  isTransactionSkipped,
  summarizeTransactionTypes,
  withoutSkippedTransactions,
} from "../../utils/transaction-filters";
import {
  parseLocalDateInput,
  parseLocalDateInputAtEndOfDay,
  parseLocalDateInputAtStartOfDay,
} from "../../utils/month-range";

export type ReportBillStatus = "all" | "paid" | "pending" | "skipped";

export type ReportSections = {
  conta: boolean;
  receita: boolean;
  despesa: boolean;
};

export type ReportSectionData = {
  type: "conta" | "receita" | "despesa";
  items: Transaction[];
  total: number;
};

export type ReportData = {
  sections: ReportSectionData[];
  billsTotal: number;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  itemCount: number;
};

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

function sortByDateAsc(a: Transaction, b: Transaction) {
  const aTime = parseLocalDateInput(a.date).getTime();
  const bTime = parseLocalDateInput(b.date).getTime();
  const safeA = Number.isNaN(aTime) ? Number.NEGATIVE_INFINITY : aTime;
  const safeB = Number.isNaN(bTime) ? Number.NEGATIVE_INFINITY : bTime;
  return safeA - safeB;
}

export function buildReportData(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
  sections: ReportSections,
  billStatus: ReportBillStatus
): ReportData {
  const start = parseLocalDateInputAtStartOfDay(startDate);
  const end = parseLocalDateInputAtEndOfDay(endDate);
  const startMs = isValidDate(start) ? start.getTime() : undefined;
  const endMs = isValidDate(end) ? end.getTime() : undefined;

  const inMonth = transactions.filter((tr) => {
    const trDate = parseLocalDateInput(tr.date);
    if (!isValidDate(trDate)) return false;
    const ms = trDate.getTime();
    if (startMs !== undefined && ms < startMs) return false;
    if (endMs !== undefined && ms > endMs) return false;
    return true;
  });

  const matchBillStatus = (tr: Transaction) => {
    if (tr.type !== "conta") return true;
    if (billStatus === "paid") return isBillPaid(tr);
    if (billStatus === "pending") return isBillPending(tr);
    if (billStatus === "skipped") return isBillSkipped(tr);
    return true;
  };

  const resultSections: ReportSectionData[] = [];
  const order: Array<"conta" | "receita" | "despesa"> = [
    "conta",
    "receita",
    "despesa",
  ];

  for (const type of order) {
    if (!sections[type]) continue;
    const items = inMonth
      .filter((tr) => tr.type === type && matchBillStatus(tr))
      .sort(sortByDateAsc);
    const countableItems = withoutSkippedTransactions(items);
    resultSections.push({
      type,
      items,
      total: countableItems.reduce((acc, tr) => acc + tr.value, 0),
    });
  }

  const flat = resultSections.flatMap((section) => section.items);
  const summary = summarizeTransactionTypes(withoutSkippedTransactions(flat));
  const billsTotal = sections.conta ? summary.billsTotal : 0;
  const incomeTotal = sections.receita ? summary.incomeTotal : 0;
  const expenseTotal = sections.despesa ? summary.expenseTotal : 0;

  return {
    sections: resultSections,
    billsTotal,
    incomeTotal,
    expenseTotal,
    balance: incomeTotal - expenseTotal - billsTotal,
    itemCount: flat.length,
  };
}

if (import.meta.env.DEV) {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`report-data self-check: ${msg}`);
  };
  const sample: Transaction[] = [
    {
      value: 100,
      date: "2026-07-05",
      description: "Aluguel",
      category: "moradia",
      type: "conta",
      paid: true,
      walletId: "w1",
    },
    {
      value: 50,
      date: "2026-07-10",
      description: "Luz",
      category: "moradia",
      type: "conta",
      paid: false,
      walletId: "w1",
    },
    {
      value: 80,
      date: "2026-07-12",
      description: "Assinatura",
      category: "lazer",
      type: "conta",
      paid: false,
      skipped: true,
      walletId: "w1",
    },
    {
      value: 3000,
      date: "2026-07-01",
      description: "Salário",
      category: "salario",
      type: "receita",
      walletId: "w1",
    },
    {
      value: 200,
      date: "2026-07-15",
      description: "Mercado",
      category: "food",
      type: "despesa",
      walletId: "w1",
    },
    {
      value: 40,
      date: "2026-07-16",
      description: "Delivery",
      category: "food",
      type: "despesa",
      skipped: true,
      walletId: "w1",
    },
    {
      value: 99,
      date: "2026-06-01",
      description: "Fora",
      category: "food",
      type: "despesa",
      walletId: "w1",
    },
  ];
  const all = buildReportData(
    sample,
    "2026-07-01",
    "2026-07-31",
    { conta: true, receita: true, despesa: true },
    "all"
  );
  assert(all.itemCount === 6, "month filter includes skipped");
  assert(all.sections[0]?.type === "conta", "contas first");
  assert(all.balance === 3000 - 200 - 150, "balance excludes skipped");
  assert(
    all.sections[0]?.total === 150,
    "conta section total excludes skipped"
  );
  const pending = buildReportData(
    sample,
    "2026-07-01",
    "2026-07-31",
    { conta: true, receita: false, despesa: false },
    "pending"
  );
  assert(pending.itemCount === 1 && pending.billsTotal === 50, "pending bills");
  const skipped = buildReportData(
    sample,
    "2026-07-01",
    "2026-07-31",
    { conta: true, receita: false, despesa: false },
    "skipped"
  );
  assert(
    skipped.itemCount === 1 &&
      isTransactionSkipped(skipped.sections[0]?.items[0]!) &&
      skipped.billsTotal === 0,
    "skipped bills listed without balance impact"
  );
}
