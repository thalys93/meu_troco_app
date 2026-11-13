import { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import {

  CalendarRange,

  Save,

  User,

  Wallet,

  Scale3D,

  Info,

  ChevronRight,

  LayoutGrid,

} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { doc, updateDoc } from "firebase/firestore";

import PrivateLayout from "../../layout/PrivateLayout";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";

import { useUser } from "@/hooks/use-user";

import useUserStore from "@/store/UserStore";

import { FireStore } from "@/utils/services/api/firebase";

import { useGetUserData } from "@/utils/services/api/auth";

import {

  getCurrentMonthKey,

  getFinancialPeriodRange,

  normalizeFinancialPeriodPreference,

} from "@/subdomains/dashboard/utils/month-range";

import { useDashboardPreferences } from "@/subdomains/dashboard/context/dashboard-preferences";

import { Link } from "react-router-dom";



const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);



function formatBuildDate(iso: string, locale: string): string {

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {

    dateStyle: "medium",

    timeStyle: "short",

  }).format(date);

}



function SettingsPageBody() {

  const { t, i18n } = useTranslation();

  const { toast } = useToast();

  const { user: userLocal } = useUser();

  const { uid } = useUserStore();

  const { refetch } = useGetUserData(uid);

  const { financialPeriod, setFinancialPeriod, selectedMonth } =

    useDashboardPreferences();



  const [startDay, setStartDay] = useState(financialPeriod.periodStartDay);

  const [endDay, setEndDay] = useState(financialPeriod.periodEndDay);

  const [saving, setSaving] = useState(false);



  useEffect(() => {

    setStartDay(financialPeriod.periodStartDay);

    setEndDay(financialPeriod.periodEndDay);

  }, [financialPeriod.periodEndDay, financialPeriod.periodStartDay]);



  const previewRange = useMemo(

    () =>

      getFinancialPeriodRange(selectedMonth, {

        periodStartDay: startDay,

        periodEndDay: endDay,

      }),

    [endDay, selectedMonth, startDay]

  );



  const systemRows = useMemo(

    () => [

      { label: t("settings.system.appName"), value: t("brand.name") },

      { label: t("settings.system.appVersion"), value: __APP_VERSION__ },

      {

        label: t("settings.system.environment"),

        value:

          import.meta.env.MODE === "production"

            ? t("settings.system.envProduction")

            : t("settings.system.envDevelopment"),

      },

      {

        label: t("settings.system.buildTime"),

        value: formatBuildDate(__APP_BUILD_TIME__, i18n.language),

      },

      {

        label: t("settings.system.interfaceLanguage"),

        value: t(`lang.${i18n.language === "pt-BR" ? "portuguese" : i18n.language === "es" ? "spanish" : "english"}`),

      },

    ],

    [i18n.language, t]

  );

  const shortcutLinks = useMemo(
    () =>
      [
        {
          href: "/dashboard/profile",
          icon: User,
          label: t("sidebar.profile"),
          description: t("settings.shortcuts.profileHint"),
          iconClass: "text-sky-600 dark:text-sky-400",
          bgClass: "bg-sky-500/12",
        },
        {
          href: "/dashboard/wallets",
          icon: Wallet,
          label: t("dashboard.actions.wallets"),
          description: t("settings.shortcuts.walletsHint"),
          iconClass: "text-violet-600 dark:text-violet-400",
          bgClass: "bg-violet-500/12",
        },
        {
          href: "/dashboard/converter",
          icon: Scale3D,
          label: t("dashboard.actions.converter"),
          description: t("settings.shortcuts.converterHint"),
          iconClass: "text-emerald-600 dark:text-emerald-400",
          bgClass: "bg-emerald-500/12",
        },
      ] satisfies {
        href: string;
        icon: LucideIcon;
        label: string;
        description: string;
        iconClass: string;
        bgClass: string;
      }[],
    [t]
  );

  const handleSave = async () => {

    if (!userLocal?.uid) return;

    const next = normalizeFinancialPeriodPreference({

      periodStartDay: startDay,

      periodEndDay: endDay,

    });

    setSaving(true);

    try {

      const userRef = doc(FireStore, "users", userLocal.uid);

      await updateDoc(userRef, {

        preferences: {

          ...userLocal.preferences,

          financialPeriod: next,

          updatedAt: new Date(),

        },

      });

      setFinancialPeriod(next);

      await refetch();

      toast({

        title: t("settings.financialPeriod.toastSuccess"),

        variant: "success",

      });

    } catch {

      toast({

        title: t("settings.financialPeriod.toastError"),

        variant: "destructive",

      });

    } finally {

      setSaving(false);

    }

  };



  const currentMonthPreview = getFinancialPeriodRange(getCurrentMonthKey(), {

    periodStartDay: startDay,

    periodEndDay: endDay,

  });



  return (

    <div className="mx-auto w-full max-w-6xl mt-4 md:mt-6 px-4 md:px-6 pb-28 space-y-6">

      <div className="space-y-1">

        <h1 className="text-2xl font-bold tracking-tight text-foreground">

          {t("settings.title")}

        </h1>

        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <Card className="rounded-3xl border border-border/40 shadow-sm h-full">

          <CardHeader className="pb-2">

            <CardTitle className="flex items-center gap-2 text-lg font-semibold">

              <CalendarRange className="h-5 w-5 text-primary" />

              {t("settings.financialPeriod.title")}

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-6">

            <p className="text-sm text-muted-foreground">

              {t("settings.financialPeriod.description")}

            </p>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-1 xl:grid-cols-2">

              <div className="space-y-2">

                <Label htmlFor="periodStartDay">

                  {t("settings.financialPeriod.startDay")}

                </Label>

                <Select

                  value={String(startDay)}

                  onValueChange={(v) => setStartDay(Number(v))}

                >

                  <SelectTrigger id="periodStartDay">

                    <SelectValue />

                  </SelectTrigger>

                  <SelectContent>

                    {DAY_OPTIONS.map((day) => (

                      <SelectItem key={`start-${day}`} value={String(day)}>

                        {t("settings.financialPeriod.dayOption", { day })}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              <div className="space-y-2">

                <Label htmlFor="periodEndDay">

                  {t("settings.financialPeriod.endDay")}

                </Label>

                <Select

                  value={String(endDay)}

                  onValueChange={(v) => setEndDay(Number(v))}

                >

                  <SelectTrigger id="periodEndDay">

                    <SelectValue />

                  </SelectTrigger>

                  <SelectContent>

                    {DAY_OPTIONS.map((day) => (

                      <SelectItem key={`end-${day}`} value={String(day)}>

                        {t("settings.financialPeriod.dayOption", { day })}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

            </div>



            <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-2 text-sm">

              <p className="font-medium text-foreground">

                {t("settings.financialPeriod.previewCurrent")}

              </p>

              <p className="text-muted-foreground font-mono text-xs">

                {currentMonthPreview.startDate} — {currentMonthPreview.endDate}

              </p>

              <p className="text-xs text-muted-foreground pt-1">

                {t("settings.financialPeriod.previewSelected", {

                  month: selectedMonth,

                })}

              </p>

              <p className="text-muted-foreground font-mono text-xs">

                {previewRange.startDate} — {previewRange.endDate}

              </p>

              <p className="text-xs text-muted-foreground pt-2">

                {t("settings.financialPeriod.crossMonthHint")}

              </p>

            </div>



            <Button

              type="button"

              className="w-full"

              disabled={saving}

              onClick={handleSave}

            >

              <Save className="h-4 w-4 mr-2" />

              {t("settings.financialPeriod.save")}

            </Button>

          </CardContent>

        </Card>



        <Card className="rounded-3xl border border-border/40 shadow-sm h-full">

          <CardHeader className="pb-2">

            <CardTitle className="flex items-center gap-2 text-lg font-semibold">

              <LayoutGrid className="h-5 w-5 text-primary" />

              {t("settings.shortcuts.title")}

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            <p className="text-sm text-muted-foreground">

              {t("settings.shortcuts.description")}

            </p>

            <div className="grid grid-cols-1 gap-3">

              {shortcutLinks.map((item) => (

                <Link

                  key={item.href}

                  to={item.href}

                  className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-3.5 shadow-sm transition-all hover:border-primary/35 hover:from-primary/5 hover:to-primary/10 hover:shadow-md active:scale-[0.99]"

                >

                  <div

                    className={cn(

                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-border/40",

                      item.bgClass

                    )}

                  >

                    <item.icon className={cn("h-5 w-5", item.iconClass)} />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">

                      {item.label}

                    </p>

                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">

                      {item.description}

                    </p>

                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />

                </Link>

              ))}

            </div>

          </CardContent>

        </Card>



        <Card className="rounded-3xl border border-border/40 shadow-sm h-full">

          <CardHeader className="pb-2">

            <CardTitle className="flex items-center gap-2 text-lg font-semibold">

              <Info className="h-5 w-5 text-primary" />

              {t("settings.system.title")}

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            <p className="text-sm text-muted-foreground">

              {t("settings.system.description")}

            </p>

            <dl className="space-y-3 text-sm">

              {systemRows.map((row) => (

                <div

                  key={row.label}

                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0"

                >

                  <dt className="text-muted-foreground">{row.label}</dt>

                  <dd className="font-medium text-foreground sm:text-right break-all">

                    {row.value}

                  </dd>

                </div>

              ))}

            </dl>

          </CardContent>

        </Card>

      </div>



      <p className="text-center text-sm text-muted-foreground">

        <Link to="/dashboard/profile" className="text-primary hover:underline">

          {t("settings.backToProfile")}

        </Link>

      </p>

    </div>

  );

}



export default function SettingsPage() {

  return (

    <PrivateLayout>

      <SettingsPageBody />

    </PrivateLayout>

  );

}

