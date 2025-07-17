
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  isPopular?: boolean;
  actions?: React.ReactNode;
}

const PricingCard = ({
  title,
  price,
  period = "/mês",
  features,
  isPopular = false,
  actions
}: PricingCardProps) => {
  return (
    <Card className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            Mais Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Grátis" && <span className="text-muted-foreground">{period}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between flex-grow">
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

      <div className="mt-auto flex justify-center">
        {actions}
      </div>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
