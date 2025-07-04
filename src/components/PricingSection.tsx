
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, TrendingUp } from 'lucide-react';
import PricingCard from './PricingCard';

const PricingSection = () => {
  const premiumFeatures = [
    "Transações ilimitadas",
    "Relatórios avançados com gráficos",
    "Metas financeiras personalizadas",
    "Lembretes automáticos",
    "Categorias personalizadas",
    "Exportar dados para Excel/PDF",
    "Suporte prioritário"
  ];

  const handleUpgrade = () => {
    // Aqui seria implementada a integração com sistema de pagamento
    console.log('Upgrade para Premium');
  };

  return (
    <div className="space-y-6">
      {/* Premium Banner */}
      <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-emerald-500/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Desbloqueie Todo o Potencial</CardTitle>
              <p className="text-muted-foreground mt-1">
                Faça upgrade para Premium e tenha acesso a recursos avançados
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {premiumFeatures.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">R$ 9,90</div>
              <div className="text-sm text-muted-foreground mb-4">/mês</div>
              <Button size="lg" onClick={handleUpgrade} className="px-8">
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <PricingCard
          title="Plano Atual (Básico)"
          price="Grátis"
          features={[
            "Até 50 transações por mês",
            "Categorias básicas",
            "Resumo mensal simples",
            "Suporte por email"
          ]}
          buttonText="Plano Atual"
          onButtonClick={() => {}}
        />
        
        <PricingCard
          title="Premium"
          price="R$ 9,90"
          period="/mês"
          features={premiumFeatures}
          isPopular={true}
          buttonText="Fazer Upgrade"
          onButtonClick={handleUpgrade}
        />
      </div>
    </div>
  );
};

export default PricingSection;
