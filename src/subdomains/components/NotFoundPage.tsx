import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import PublicLayout from "../app/layout/PublicLayout";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SmileySadIcon } from "@phosphor-icons/react";

const NotFoundPage = () => {
  const { theme } = useTheme();
  return (
    <PublicLayout type="simple">
      <div className={cn("min-h-screen flex items-center justify-center ", theme === "dark" && "bg-gradient-to-br from-indigo-950 via-slate-900/50 to-emerald-800/50")}>
        <div className="flex items-center justify-center flex-col select-none">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! a página que voce estava procurando não foi encontrada</p>
          <Link to="/">
            <Button variant="link">
              Voltar para o inicio
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;
