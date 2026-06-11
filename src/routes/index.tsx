import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFoundPage from "@/subdomains/components/NotFoundPage";
import { AllRoutes } from "./map";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const RouteFallback = () => (
    <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
);

const applyPrefix = (prefix: string | undefined, path: string) =>
    `${prefix ? `/${prefix}` : ""}/${path}`.replace(/\/+$/, "");

const renderAllRoutes = () => {
    const elements: JSX.Element[] = [];

    for (const group of AllRoutes) {
        const { public: pub = [], private: priv = [], prefix, guardRedirectTo, guardRequireAdmin } = group;

        for (const route of pub) {
            const fullPath = applyPrefix(prefix, route.path);
            const Element = route.element;
            elements.push(
                <Route
                    key={fullPath}
                    path={fullPath}
                    element={
                        <Suspense fallback={<RouteFallback />}>
                            <Element />
                        </Suspense>
                    }
                />
            );
        }

        for (const route of priv) {
            const fullPath = applyPrefix(prefix, route.path);
            const Element = route.element;
            const guardRedirectToPath = guardRedirectTo ?? "/oauth/login";
            elements.push(
                <Route
                    key={fullPath}
                    path={fullPath}
                    element={
                        <ProtectedRoute
                            redirectTo={guardRedirectToPath}
                            requireAdmin={guardRequireAdmin ?? false}
                        >
                            <Suspense fallback={<RouteFallback />}>
                                <Element />
                            </Suspense>
                        </ProtectedRoute>
                    }
                />
            );
        }
    }

    return elements;
};

export default function AppRoutes() {
    return (
        <Routes>
            {renderAllRoutes()}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
