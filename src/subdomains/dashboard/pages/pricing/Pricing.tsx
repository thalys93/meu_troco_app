
import React from 'react';
import PricingSection from '@/components/PricingSection';
import { ArrowLeft, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Planos Premium</h1>
            <p className="text-muted-foreground">Escolha o plano ideal para suas necessidades</p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <PricingSection />
    </div>
  );
};

export default PricingPage;
