import { Navigate } from "react-router-dom";
import useUserStore from "@/store/UserStore";
import { AccountTypes } from "@/types/enums/AccountsTypes";
import { useGetUserData } from "@/utils/services/api/auth";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

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
  const { data: userData, isFetching } = useGetUserData(
    requireAdmin && uid && !user ? uid : undefined
  );

  if (!uid) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin) {
    if (user?.accountType === AccountTypes.ADMIN) return <>{children}</>;
    if (user) return <Navigate to={redirectTo} replace />;

    if (!user && uid) {
      if (isFetching) {
        return (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        );
      }
      if (userData?.accountType === AccountTypes.ADMIN) {
        return <>{children}</>;
      }
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}
