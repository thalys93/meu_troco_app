import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  className?: string;
  /** Optional accent for icon (e.g. text-primary, text-amber-500) */
  iconClassName?: string;
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  className,
  iconClassName,
}: MetricCardProps) => {
  const isPositive = subtitle?.startsWith('+');
  return (
    <Card
      className={cn(
        'border border-border/80 bg-card shadow-sm hover:shadow transition-shadow duration-200',
        className
      )}
      role="article"
      aria-label={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className={cn('h-5 w-5 text-muted-foreground', iconClassName)} aria-hidden />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p
            className={cn(
              'text-xs mt-1',
              isPositive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
