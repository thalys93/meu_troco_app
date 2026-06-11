import Footer from '@/subdomains/app/components/Footer';
import Navigation from '@/subdomains/app/components/Navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen backoffice-page text-foreground">
      <Navigation type="simple" title={t('backoffice.brand')} />
      {children}
      <Footer />
    </main>
  );
}

export default PublicLayout;
