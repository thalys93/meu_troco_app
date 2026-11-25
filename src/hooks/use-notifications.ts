import { useQueryClient } from '@tanstack/react-query';
import useUserStore from '@/store/UserStore';
import {
    useGetNotifications,
    useGetUnreadCount,
    useMarkAsRead as useMarkAsReadMutation,
    useMarkAllAsRead as useMarkAllAsReadMutation
} from '@/utils/services/api/notifications-service';

export function useNotifications() {
    const queryClient = useQueryClient();
    const uid = useUserStore((s) => s.uid);

    const { data: notifications = [], isLoading: isLoadingList } = useGetNotifications();
    const { data: unreadCount = 0, isLoading: isLoadingCount } = useGetUnreadCount(uid ?? null);
    const markAsReadMutation = useMarkAsReadMutation();
    const markAllAsReadMutation = useMarkAllAsReadMutation();

    const markAsRead = (notificationId: string) => {
        if (!uid) return;
        markAsReadMutation.mutate(
            { notificationId, uid },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                }
            }
        );
    };

    const markAllAsRead = () => {
        if (!uid) return;
        markAllAsReadMutation.mutate(uid, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
        });
    };

    return {
        notifications,
        unreadCount,
        isLoading: isLoadingList || isLoadingCount,
        markAsRead,
        markAllAsRead,
        isMarkingAsRead: markAsReadMutation.isPending,
        isMarkingAllAsRead: markAllAsReadMutation.isPending
    };
}
