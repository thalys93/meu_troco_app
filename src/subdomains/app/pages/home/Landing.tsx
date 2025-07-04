import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  PieChart,
  TrendingUp,
  Smartphone,
  Shield,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PricingCard from '@/components/PricingCard';
import PublicLayout from '@/subdomains/app/layout/PublicLayout';

const LandingPage = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: TrendingUp,
      title: "Acompanhamento de despesas e receitas",
      description: "Registre e monitore todas suas transações financeiras"
    },
    {
      icon: Zap,
      title: "Registro rápido de transações",
      description: "Adicione receitas e despesas em segundos"
    },
    {
      icon: PieChart,
      title: "Resumo do mês atual",
      description: "Visualize sua situação financeira de forma clara"
    },
    {
      icon: Smartphone,
      title: "Interface responsiva e intuitiva",
      description: "Acesse de qualquer dispositivo com facilidade"
    }
  ];

  const benefits = [
    "100% online - acesse de qualquer lugar",
    "Interface simples e segura",
    "Sem complicações desnecessárias",
    "Ideal para uso pessoal"
  ];

  const pricingPlans = [
    {
      title: "Básico",
      price: "Grátis",
      period: "",
      features: [
        "Até 50 transações por mês",
        "Categorias básicas",
        "Resumo mensal",
        "Suporte por email"
      ],
      buttonText: "Começar Grátis",
      isPopular: false
    },
    {
      title: "Premium",
      price: "R$ 9,90",
      period: "/mês",
      features: [
        "Transações ilimitadas",
        "Categorias personalizadas",
        "Relatórios avançados",
        "Metas financeiras",
        "Lembretes automáticos",
        "Exportar dados",
        "Suporte prioritário"
      ],
      buttonText: "Assinar Premium",
      isPopular: true
    },
    {
      title: "Família",
      price: "R$ 19,90",
      period: "/mês",
      features: [
        "Todos os recursos Premium",
        "Até 5 usuários",
        "Orçamento compartilhado",
        "Relatórios familiares",
        "Controle parental",
        "Backup automático"
      ],
      buttonText: "Assinar Família",
      isPopular: false
    }
  ];

  const handlePricingClick = (planTitle: string) => {
    if (planTitle === "Básico") {
      navigate('oauth/login');
    } else {
      // Aqui seria implementada a integração com sistema de pagamento
      console.log(`Selecionado plano: ${planTitle}`);
      navigate('oauth/login');
    }
  };

  return (
    <PublicLayout type='full'>      
      <section id="hero" className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/20 rounded-2xl mb-6 group">
              <img src="/favicon.png" className='rounded-2xl group-hover:scale-110 transition-all'/>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-emerald-300 bg-clip-text text-transparent">
              Meu Troco
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Seu dinheiro sob controle, do seu jeito.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-4 h-auto"
              onClick={() => navigate('oauth/login')}
            >
              Comece agora
            </Button>
          </div>
        </div>
      </section>

      <section id="sobre" className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Controle financeiro sem complicação
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            O Meu Troco é o aplicativo perfeito para quem quer manter suas finanças organizadas
            de forma simples e eficiente. Com uma interface intuitiva e recursos essenciais,
            você pode acompanhar seus gastos, visualizar suas contas mensais e manter tudo
            sob controle com total segurança.
          </p>
        </div>
      </section>

      <section id="funcionalidades" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Funcionalidades
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card group hover:border-emerald-400 border-1 transition-all duration-500">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg mb-4 mx-auto group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-emerald-400 transition-all select-none">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center group-hover:text-emerald-200 transition-all select-none">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      
      {/* <section id="precos" className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-lg text-muted-foreground">
              Comece grátis e faça upgrade quando precisar de mais recursos
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                title={plan.title}
                price={plan.price}
                period={plan.period}
                features={plan.features}
                isPopular={plan.isPopular}
                buttonText={plan.buttonText}
                onButtonClick={() => handlePricingClick(plan.title)}
              />
            ))}
          </div>
        </div>
      </section> */}

      <section id="beneficios" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto group">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Por que usar o <b className='group-hover:text-emerald-400 transition-all duration-300'>Meu Troco</b>?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="w-64 h-64 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-24 h-24 text-primary group-hover:text-emerald-200 transition-all group-hover:scale-110" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center group">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Chega de <b className='group-hover:text-emerald-400 transition-all'>planilhas</b>. Mantenha seu <b className='group-hover:text-emerald-400 transition-all'>dinheiro</b> organizado com facilidade.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece hoje mesmo a ter controle total sobre suas <b className='group-hover:text-emerald-400 transition-all'>finanças pessoais</b>.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-4 h-auto"
            onClick={() => navigate('oauth/login')}
          >
            Acessar o Meu Troco
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;
