import useUserStore from '@/store/UserStore';
import type { UserStatus } from '@/types/entities/User';

export const getUserStatus = (status?: UserStatus): UserStatus => status ?? 'active';

export const useAccountStatus = () => {
    const { user } = useUserStore();
    const status = getUserStatus(user?.status);

    return {
        status,
        isActive: status === 'active',
        isInactive: status === 'inactive',
        isBlocked: status === 'blocked',
        isReadOnly: status === 'blocked',
    };
};
