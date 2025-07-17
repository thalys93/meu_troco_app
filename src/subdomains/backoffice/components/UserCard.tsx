
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  title: string;  
  value: string | number;
  icon: LucideIcon;  
  className?: string;
  textColor?: string
}

const UserCard = ({ title, value, icon: Icon, className, textColor }: StatCardProps) => {
  const {t} = useTranslation();
  return (
    <Card className={cn("glass-card hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-start gap-3 space-y-0 pb-2">
        <Icon className={cn("h-5 w-5 text-primary", textColor)} />
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>        
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-foreground">
          {t('userCard.title')} {value}
        </div>        
      </CardContent>
    </Card>
  );
};

export default UserCard;
