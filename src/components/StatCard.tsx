
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down';
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, trendDirection, className }: StatCardProps) => {
  return (
    <Card className={cn("glass-card hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5 text-primary", trendDirection === 'up' ? "text-emerald-400" : "text-red-400")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trendDirection === 'up' ? "text-emerald-400" : "text-red-400"
          )}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
