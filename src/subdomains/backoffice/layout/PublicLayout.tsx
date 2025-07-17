import Footer from '@/subdomains/app/components/Footer'
import Navigation from '@/subdomains/app/components/Navigation'
import React from 'react'

function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className='min-h-screen bg-background text-foreground'>
            <Navigation type="simple" title='Meu Troco Backoffice' />
            {children}
            <Footer/>
        </main>
    )
}

export default PublicLayout