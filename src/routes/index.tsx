import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFoundPage from "@/subdomains/components/NotFoundPage";
import { AllRoutes } from "./map";

const applyPrefix = (prefix: string | undefined, path: string) =>
    `${prefix ? `/${prefix}` : ""}/${path}`.replace(/\/+$/, "");

const renderAllRoutes = () => {
    const elements: JSX.Element[] = [];

    for (const group of AllRoutes) {
        const { public: pub = [], private: priv = [], prefix, guardRedirectTo, guardRequireAdmin } = group;

        for (const route of pub) {
            const fullPath = applyPrefix(prefix, route.path);
            const Element = route.element;
            elements.push(<Route key={fullPath} path={fullPath} element={<Element />} />);
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
                            <Element />
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
