import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function Navigation({ type }: { type: "simple" | "full" }) {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const location = useLocation();

    const isCallBack = location.pathname === "/oauth/callback"

    const navigationItems = [
        { name: 'Início', href: '#hero' },
        { name: 'Sobre', href: '#sobre' },
        { name: 'Funcionalidades', href: '#funcionalidades' },
        // { name: 'Preços', href: '#precos' },
        { name: 'Benefícios', href: '#beneficios' },
    ];

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    switch (type) {
        case "full":
            return (
                <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => scrollToSection('#hero')}>
                                <img src="/favicon_big.png" className="w-8 h-8 text-primary group-hover:text-emerald-400 transition-all rounded" />
                                <span className="text-xl font-bold select-none group-hover:text-emerald-400 transition-all">Meu Troco</span>
                            </div>
                            <div className="hidden md:flex items-center space-x-8">
                                {navigationItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => scrollToSection(item.href)}
                                        className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                                    >
                                        {item.name}
                                    </button>
                                ))}
                                <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                    <Button onClick={() => navigate('oauth/login')}>
                                        Entrar
                                    </Button>
                                </div>
                            </div>

                            <div className="md:hidden flex items-center gap-2">
                                <ThemeToggle />
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>

                        {mobileMenuOpen && (
                            <div className="md:hidden py-4 border-t border-border/50">
                                <div className="flex flex-col space-y-4">
                                    {navigationItems.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => scrollToSection(item.href)}
                                            className="text-left text-muted-foreground hover:text-primary transition-colors duration-200 font-medium py-2"
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                    <Button onClick={() => navigate('oauth/login')} className="mt-4">
                                        Entrar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            );
        case "simple":
            return (
                <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
                                <img src="/favicon_big.png" className="w-8 h-8 text-primary group-hover:text-emerald-400 transition-all rounded" />
                                <span className="text-xl font-bold select-none group-hover:text-emerald-400 transition-all">Meu Troco</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <Button onClick={() => navigate("/")} disabled={isCallBack}>                                    
                                    Voltar
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>
            );
    }
}

export default Navigation