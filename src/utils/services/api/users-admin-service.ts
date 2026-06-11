import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FireStore } from './firebase';
import type { UserStatus } from '@/types/entities/User';
import type { AccountTypes } from '@/types/enums/AccountsTypes';
import { FREE_PLAN_KEY } from '@/subdomains/backoffice/pages/users/users-list-utils';

export type UserAdminUpdateInput = {
    uid: string;
    accountType: AccountTypes;
    status: UserStatus;
    selectedPlan: string;
};

const resolveSelectedPlanValue = (selectedPlan: string): string => {
    if (selectedPlan === FREE_PLAN_KEY) return '';
    return selectedPlan.trim();
};

export const updateUserAdmin = async ({
    uid,
    accountType,
    status,
    selectedPlan,
}: UserAdminUpdateInput): Promise<void> => {
    const ref = doc(FireStore, 'users', uid);
    const planValue = resolveSelectedPlanValue(selectedPlan);

    await updateDoc(ref, {
        accountType,
        status,
        'billing.selectedPlan': planValue,
        'billing.accountType': accountType,
        updatedAt: serverTimestamp(),
    });
};

export const useUpdateUserAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserAdmin,
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', data.uid] });
        },
        retry: false,
    });
};
