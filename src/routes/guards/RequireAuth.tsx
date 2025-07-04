import { useAuth } from "@/hooks/use-auth";
import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    return !isAuthenticated ? <>{children}</> : <Navigate to="/oauth/login" replace />;
}