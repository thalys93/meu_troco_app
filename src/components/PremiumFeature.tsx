
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';

interface PremiumFeatureProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onUpgrade?: () => void;
}

const PremiumFeature = ({ title, description, icon, onUpgrade }: PremiumFeatureProps) => {
  return (
    <Card className="relative opacity-75 border-dashed border-primary/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg"></div>
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              <Crown className="w-5 h-5 text-primary" />
            </CardTitle>
          </div>
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button variant="outline" size="sm" onClick={onUpgrade}>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade para Premium
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumFeature;
