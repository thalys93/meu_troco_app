import type { LucideIcon } from 'lucide-react';
import {
    Banknote,
    Briefcase,
    CircleDollarSign,
    Clock,
    Laptop,
    TrendingUp,
    Home,
    UtensilsCrossed,
    Car,
    Wrench,
    Heart,
    Gamepad2,
    ShoppingCart,
    GraduationCap,
    Plane,
    HandCoins,
    CreditCard,
    Tag,
    List,
    Ham
} from 'lucide-react';

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
    Banknote,
    Briefcase,
    CircleDollarSign,
    Clock,
    Laptop,
    TrendingUp,
    Home,
    UtensilsCrossed,
    Car,
    Wrench,
    Heart,
    Gamepad2,
    ShoppingCart,
    GraduationCap,
    Plane,
    HandCoins,
    CreditCard,
    Tag,
    List,
    Ham,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICON_MAP);

export function resolveCategoryIcon(iconName: string): LucideIcon | undefined {
    return CATEGORY_ICON_MAP[iconName];
}
