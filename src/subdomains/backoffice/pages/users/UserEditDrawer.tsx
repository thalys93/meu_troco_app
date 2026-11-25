import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import type { User, UserStatus } from '@/types/entities/User';
import { AccountTypes } from '@/types/enums/AccountsTypes';
import { useGetActivePlans } from '@/utils/services/api/plans';
import { useUpdateUserAdmin } from '@/utils/services/api/users-admin-service';
import { getUserDisplayName, getUserPlanKey } from './users-list-utils';
import { useTranslation } from 'react-i18next';
import { Loader2, Save } from 'lucide-react';

type UserEditDrawerProps = {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function UserEditDrawer({ user, open, onOpenChange }: UserEditDrawerProps) {
    const { t } = useTranslation();
    const { data: plans = [] } = useGetActivePlans();
    const updateUser = useUpdateUserAdmin();
    const [accountType, setAccountType] = React.useState<AccountTypes>(AccountTypes.USER);
    const [status, setStatus] = React.useState<UserStatus>('active');
    const [selectedPlan, setSelectedPlan] = React.useState('');

    React.useEffect(() => {
        if (!user) return;
        setAccountType(user.accountType ?? AccountTypes.USER);
        setStatus(user.status ?? 'active');
        setSelectedPlan(getUserPlanKey(user));
    }, [user]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user?.uid) return;

        updateUser.mutate({
            uid: user.uid,
            accountType,
            status,
            selectedPlan,
        }, {
            onSuccess: () => {
                toast({
                    title: t('toast.success'),
                    description: t('users.backoffice.edit.success', 'Usuário atualizado com sucesso.'),
                });
                onOpenChange(false);
            },
            onError: () => {
                toast({
                    title: t('toast.error'),
                    description: t('users.backoffice.edit.error', 'Não foi possível atualizar o usuário.'),
                    variant: 'destructive',
                });
            },
        });
    };

    const displayName = user ? getUserDisplayName(user) : '';
    const fullName = user?.fullName || displayName;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t('users.backoffice.edit.title', 'Editar usuário')}</SheetTitle>
                    <SheetDescription>
                        {user?.email}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="space-y-2">
                        <Label>{t('users.backoffice.edit.displayName', 'Nome de exibição')}</Label>
                        <Input name="displayName" value={displayName} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('users.backoffice.edit.fullName', 'Nome completo')}</Label>
                        <Input name="fullName" value={fullName} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('login.emailInput')}</Label>
                        <Input name="email" value={user?.email ?? ''} disabled />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('users.backoffice.edit.accountType', 'Tipo de conta')}</Label>
                            <Select value={accountType} onValueChange={(value) => setAccountType(value as AccountTypes)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={AccountTypes.USER}>{t('users.backoffice.accountType.user')}</SelectItem>
                                    <SelectItem value={AccountTypes.ADMIN}>{t('users.backoffice.accountType.admin')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('users.backoffice.edit.status', 'Status')}</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as UserStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{t('users.backoffice.status.active', 'Ativo')}</SelectItem>
                                    <SelectItem value="inactive">{t('users.backoffice.status.inactive', 'Inativo')}</SelectItem>
                                    <SelectItem value="blocked">{t('users.backoffice.status.blocked', 'Bloqueado')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('users.backoffice.fieldPlan')}</Label>
                        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="free">{t('users.backoffice.plan.free')}</SelectItem>
                                {plans.map((plan) => (
                                    <SelectItem key={plan.id ?? plan.title} value={plan.title}>
                                        {plan.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('default.cancel', 'Cancelar')}
                        </Button>
                        <Button type="submit" disabled={updateUser.isPending}>
                            {updateUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {t('default.save')}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

export default UserEditDrawer;
