import { DollarSign, Facebook, Instagram, Twitter } from 'lucide-react'

function Footer() {
    return (
        <footer className="border-t border-border/50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="w-6 h-6 text-primary" />
                                <span className="text-xl font-bold select-none">Meu Troco</span>
                            </div>
                            <p className="text-muted-foreground">
                                Seu dinheiro sob controle, do seu jeito.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Links</h3>
                            <div className="space-y-2">
                                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                                    Política de Privacidade
                                </a>
                                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                                    Termos de Uso
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Redes Sociais</h3>
                            <div className="flex gap-4">
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground select-none hover:text-emerald-500 transition-all">
                        <p>&copy; {new Date().getFullYear()} Meu Troco. Todos os direitos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer