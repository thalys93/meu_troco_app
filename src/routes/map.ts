import LandingPage from "@/subdomains/app/pages/home/Landing";
import LoginPage from "@/subdomains/app/pages/oauth/Login";
import RegisterPage from "@/subdomains/app/pages/oauth/Register";
import DashboardPage from "@/subdomains/dashboard/pages/dashboard/Dashboard";
import ExpensesPage from "@/subdomains/dashboard/pages/expenses/Expenses";
import IncomePage from "@/subdomains/dashboard/pages/income/Income";
import PaymentsPage from "@/subdomains/dashboard/pages/payments/Payments";
import ProfilePage from "@/subdomains/dashboard/pages/profile/Profile";
import TransactionsPage from "@/subdomains/dashboard/pages/transactions/Transactions";
import { ReactElement } from "react";


type RouteItem = {
    path: string
    element: () => ReactElement;
};

type RoutesGroup = {
    public?: RouteItem[];
    private?: RouteItem[];
    prefix?: string;
}

export const AppRoutes: RoutesGroup = {
    prefix: "",
    public: [
        { path: "", element: LandingPage },
        { path: "oauth/login", element: LoginPage },
        { path: "oauth/register", element: RegisterPage }
    ]
}

export const DashboardRoutes: RoutesGroup = {
    prefix: "/dashboard",
    private: [
        { path: "", element: DashboardPage },
        { path: 'income', element: IncomePage },
        { path: 'income/:id', element: IncomePage },
        { path: 'expenses', element: ExpensesPage },
        { path: 'expenses/:id', element: ExpensesPage },
        { path: 'payments', element: PaymentsPage },        
        { path: 'profile', element: ProfilePage },
        { path: 'transactions', element: TransactionsPage},
    ]
}

export const AllRoutes: RoutesGroup[] = [AppRoutes, DashboardRoutes]