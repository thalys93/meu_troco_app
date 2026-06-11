import LandingPage from "@/subdomains/app/pages/home/Landing";
import LoginPage from "@/subdomains/app/pages/oauth/Login";
import RegisterPage from "@/subdomains/app/pages/oauth/Register";
import PlansFormComponent from "@/subdomains/backoffice/pages/plans/PlanForm";
import SessionValidation from "@/subdomains/backoffice/components/SessionValidation";
import BackofficeHomePage from "@/subdomains/backoffice/pages/home/Home";
import BackofficeLoginPage from "@/subdomains/backoffice/pages/login/Login";
import PlansPage from "@/subdomains/backoffice/pages/plans/Plans";
import BackOfficeProfilePage from "@/subdomains/backoffice/pages/profile/Profile";
import NotificationsPage from "@/subdomains/backoffice/pages/notifications/Notifications";
import NotificationFormPage from "@/subdomains/backoffice/pages/notifications/NotificationForm";
import CategoriesPage from "@/subdomains/backoffice/pages/categories/Categories";
import CategoryFormPage from "@/subdomains/backoffice/pages/categories/CategoryForm";
import UsersPage from "@/subdomains/backoffice/pages/users/Users";
import DashboardPage from "@/subdomains/dashboard/pages/home/Dashboard";
import ExpensesPage from "@/subdomains/dashboard/pages/expenses/Expenses";
import IncomePage from "@/subdomains/dashboard/pages/income/Income";
import ContasPage from "@/subdomains/dashboard/pages/contas/Contas";
import PaymentsPage from "@/subdomains/dashboard/pages/payments/Payments";
import ProfilePage from "@/subdomains/dashboard/pages/profile/Profile";
import TransactionsPage from "@/subdomains/dashboard/pages/transactions/Transactions";
import CurrencyConverter from "@/subdomains/dashboard/pages/converter/CurrencyConverter";
import CardsPage from "@/subdomains/dashboard/pages/cards/CardsPage";
import WalletsPage from "@/subdomains/dashboard/pages/wallets/WalletsPage";
import { ReactElement } from "react";


type RouteItem = {
    path: string
    element: () => ReactElement;
};

type RoutesGroup = {
    public?: RouteItem[];
    private?: RouteItem[];
    prefix?: string;
    /** Redirect path when guard fails; required when group has private routes. */
    guardRedirectTo?: string;
    /** When true, only users with accountType ADMIN can access private routes. */
    guardRequireAdmin?: boolean;
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
    guardRedirectTo: "/oauth/login",
    guardRequireAdmin: false,
    private: [
        { path: "", element: DashboardPage },
        { path: 'income', element: IncomePage },
        { path: 'income/:id', element: IncomePage },
        { path: 'expenses', element: ExpensesPage },
        { path: 'expenses/:id', element: ExpensesPage },
        { path: 'contas', element: ContasPage },
        { path: 'contas/:id', element: ContasPage },
        { path: 'payments', element: PaymentsPage },
        { path: 'profile', element: ProfilePage },
        { path: 'transactions', element: TransactionsPage },
        { path: 'converter', element: CurrencyConverter },
        { path: 'wallets', element: WalletsPage },
        { path: 'cards', element: CardsPage },
    ]
}

export const BackOfficeRoutes: RoutesGroup = {
    prefix: "/backoffice",
    guardRedirectTo: "/backoffice/login",
    guardRequireAdmin: true,
    public: [
        { path: "login", element: BackofficeLoginPage },
        { path: "session-validation", element: SessionValidation },
    ],
    private: [
        { path: "home", element: BackofficeHomePage },
        { path: "users", element: UsersPage },
        { path: "plans", element: PlansPage },
        { path: "plan/:id?", element: PlansFormComponent },
        { path: "notifications", element: NotificationsPage },
        { path: "notification/:id?", element: NotificationFormPage },
        { path: "categories", element: CategoriesPage },
        { path: "category/:id?", element: CategoryFormPage },
        { path: "profile", element: BackOfficeProfilePage }
    ]
}

export const AllRoutes: RoutesGroup[] = [AppRoutes, DashboardRoutes, BackOfficeRoutes]