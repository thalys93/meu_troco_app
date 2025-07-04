import { Routes, Route } from "react-router-dom";
import NotFoundPage from "@/subdomains/layout/NotFoundPage";
import RequireAuth from "./guards/RequireAuth";
import { AllRoutes } from "./map";

const renderAllRoutes = () => {
    const elements: JSX.Element[] = [];

    const applyPrefix = (prefix: string | undefined, path: string) =>
        `${prefix ? `/${prefix}` : ""}/${path}`.replace(/\/+$/, "");

    for (const group of AllRoutes) {
        const { public: pub = [], private: priv = [], prefix } = group;

        for (const route of pub) {
            const fullPath = applyPrefix(prefix, route.path);
            const Element = route.element;
            elements.push(<Route key={fullPath} path={fullPath} element={<Element />} />);
        }

        for (const route of priv) {
            const fullPath = applyPrefix(prefix, route.path);
            const Element = route.element;
            elements.push(
                <Route
                    key={fullPath}
                    path={fullPath}
                    element={
                        <RequireAuth>
                            <Element />
                        </RequireAuth>
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
