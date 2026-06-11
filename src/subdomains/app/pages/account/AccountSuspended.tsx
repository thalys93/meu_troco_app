import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function AccountSuspendedPage() {
    const { t } = useTranslation();

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-950/10 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-border/70 bg-card/90 shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                        <ShieldAlert className="h-7 w-7" />
                    </span>
                    <div className="space-y-2">
                        <CardTitle>{t('account.suspended.title', 'Conta inativa')}</CardTitle>
                        <CardDescription>
                            {t('account.suspended.description', 'Sua conta está inativa no momento. Entre em contato com o suporte para reativar o acesso.')}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button asChild>
                        <Link to="/oauth/login">{t('navigation.back')}</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}

export default AccountSuspendedPage;
