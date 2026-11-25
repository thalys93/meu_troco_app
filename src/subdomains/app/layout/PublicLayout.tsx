import React from 'react'
import Navigation from '@/subdomains/app/components/Navigation';
import Footer from '@/subdomains/app/components/Footer';


function PublicLayout({ children, type }: { children: React.ReactNode, type: 'simple' | 'full' }) {
    switch (type) {
        case 'full':
            return (
                <main className="min-h-screen bg-background text-foreground">
                    <Navigation type='full' />
                    {children}
                    <Footer />
                </main>
            )
        case 'simple':
            return (
                <main className="min-h-screen bg-background text-foreground">
                    <Navigation type='simple' />
                    {children}
                    <Footer />
                </main>
            )
    }

}

export default PublicLayout
