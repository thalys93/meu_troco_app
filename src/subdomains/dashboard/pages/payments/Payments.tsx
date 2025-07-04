
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Check, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PricingCard from '@/components/PricingCard';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (planName: string, price: string) => {
    setIsProcessing(true);
    
    // Simular processamento de pagamento
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Pagamento Concluído! 🎉",
        description: `Upgrade para ${planName} realizado com sucesso. Bem-vindo ao Premium!`,
        duration: 5000,
      });
      
      // Redirecionar para o dashboard após o pagamento
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
    }, 3000);
  };

  const plans = [
    {
      name: "Básico",
      price: "Grátis",
      period: "",
      features: [
        "Até 50 transações por mês",
        "Categorias básicas",
        "Resumo mensal simples",
        "Suporte por email"
      ],
      buttonText: "Plano Atual",
      isCurrentPlan: true
    },
    {
      name: "Premium",
      price: "R$ 9,90",
      period: "/mês",
      features: [
        "Transações ilimitadas",
        "Relatórios avançados com gráficos",
        "Metas financeiras personalizadas",
        "Lembretes automáticos",
        "Categorias personalizadas",
        "Exportar dados para Excel/PDF",
        "Suporte prioritário"
      ],
      buttonText: "Fazer Upgrade",
      isPopular: true
    },
    {
      name: "Enterprise",
      price: "R$ 29,90",
      period: "/mês",
      features: [
        "Tudo do Premium",
        "Múltiplas contas",
        "Relatórios personalizados",
        "API de integração",
        "Suporte 24/7",
        "Consultoria financeira",
        "Backup automático em nuvem"
      ],
      buttonText: "Contatar Vendas"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Pagamentos</h1>
            <p className="text-muted-foreground">Gerencie sua assinatura e métodos de pagamento</p>
          </div>
        </div>
      </div>

      {/* Status Atual */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Status da Assinatura
            </CardTitle>
            <Badge variant="outline" className="text-primary border-primary">
              Plano Básico
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">Grátis</p>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
            </div>
            <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
              <p className="text-2xl font-bold text-emerald-400">42</p>
              <p className="text-sm text-muted-foreground">Transações restantes</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">∞</p>
              <p className="text-sm text-muted-foreground">Com Premium</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Escolha seu Plano</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.name}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              isPopular={plan.isPopular}
              buttonText={isProcessing ? "Processando..." : plan.buttonText}
              onButtonClick={() => {
                if (plan.name === "Premium") {
                  handlePayment(plan.name, plan.price);
                } else if (plan.name === "Enterprise") {
                  toast({
                    title: "Entre em contato",
                    description: "Nossa equipe entrará em contato em breve!",
                  });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Informações de Segurança */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            Pagamento Seguro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Criptografia SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Certificação PCI DSS</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Pagamentos processados via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Cancelamento a qualquer momento</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsPage;
