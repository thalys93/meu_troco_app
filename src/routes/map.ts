import LandingPage from "@/subdomains/app/pages/home/Landing";
import LoginPage from "@/subdomains/app/pages/oauth/Login";
import RegisterPage from "@/subdomains/app/pages/oauth/Register";
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
import { lazy, type ComponentType } from "react";
import AccountSuspendedPage from "@/subdomains/app/pages/account/AccountSuspended";

const PlansFormComponent = lazy(() => import("@/subdomains/backoffice/pages/plans/PlanForm"));
const SessionValidation = lazy(() => import("@/subdomains/backoffice/components/SessionValidation"));
const BackofficeHomePage = lazy(() => import("@/subdomains/backoffice/pages/home/Home"));
const BackofficeLoginPage = lazy(() => import("@/subdomains/backoffice/pages/login/Login"));
const PlansPage = lazy(() => import("@/subdomains/backoffice/pages/plans/Plans"));
const BackOfficeProfilePage = lazy(() => import("@/subdomains/backoffice/pages/profile/Profile"));
const NotificationsPage = lazy(() => import("@/subdomains/backoffice/pages/notifications/Notifications"));
const NotificationFormPage = lazy(() => import("@/subdomains/backoffice/pages/notifications/NotificationForm"));
const CategoriesPage = lazy(() => import("@/subdomains/backoffice/pages/categories/Categories"));
const CategoryFormPage = lazy(() => import("@/subdomains/backoffice/pages/categories/CategoryForm"));
const UsersPage = lazy(() => import("@/subdomains/backoffice/pages/users/Users"));
const GoalCatalogPage = lazy(() => import("@/subdomains/backoffice/pages/goal-catalog/GoalCatalog"));
const InternalTasksPage = lazy(() => import("@/subdomains/backoffice/pages/internal-tasks/InternalTasks"));
const InternalTaskViewPage = lazy(() => import("@/subdomains/backoffice/pages/internal-tasks/InternalTaskView"));
const InternalTaskFormPage = lazy(() => import("@/subdomains/backoffice/pages/internal-tasks/InternalTaskForm"));
const RoadmapPage = lazy(() => import("@/subdomains/backoffice/pages/roadmap/Roadmap"));
const RoadmapCatalogPage = lazy(() => import("@/subdomains/backoffice/pages/roadmap/RoadmapCatalog"));

type RouteItem = {
    path: string
    element: ComponentType;
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
        { path: "oauth/register", element: RegisterPage },
        { path: "account-suspended", element: AccountSuspendedPage }
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
        { path: "goal-catalog", element: GoalCatalogPage },
        { path: "internal-tasks", element: InternalTasksPage },
        { path: "internal-task/new", element: InternalTaskFormPage },
        { path: "internal-task/:id/edit", element: InternalTaskFormPage },
        { path: "internal-task/:id", element: InternalTaskViewPage },
        { path: "roadmap", element: RoadmapPage },
        { path: "roadmap-catalog", element: RoadmapCatalogPage },
        { path: "notifications", element: NotificationsPage },
        { path: "notification/:id?", element: NotificationFormPage },
        { path: "categories", element: CategoriesPage },
        { path: "category/:id?", element: CategoryFormPage },
        { path: "profile", element: BackOfficeProfilePage }
    ]
}

export const AllRoutes: RoutesGroup[] = [AppRoutes, DashboardRoutes, BackOfficeRoutes]