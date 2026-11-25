import { Navigate } from "react-router-dom";
import useUserStore from "@/store/UserStore";
import { AccountTypes } from "@/types/enums/AccountsTypes";
import { useGetUserData } from "@/utils/services/api/auth";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { User } from "@/types/entities/User";
import { getUserStatus } from "@/hooks/use-account-status";

type ProtectedRouteProps = {
  redirectTo: string;
  requireAdmin?: boolean;
  children: ReactNode;
};

export function ProtectedRoute({
  redirectTo,
  requireAdmin = false,
  children,
}: ProtectedRouteProps) {
  const { uid, user } = useUserStore();
  const { data: userData, isFetching } = useGetUserData(uid && !user ? uid : undefined);
  const resolvedUser = user ?? (userData as User | null | undefined);
  const status = getUserStatus(resolvedUser?.status);

  if (!uid) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!resolvedUser && isFetching) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "inactive") {
    return <Navigate to="/account-suspended" replace />;
  }

  if (requireAdmin) {
    if (resolvedUser?.accountType === AccountTypes.ADMIN) return <>{children}</>;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
