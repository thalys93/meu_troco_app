import React from 'react';
import { cn } from '@/lib/utils';

interface PageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const PageShell = ({ title, description, actions, children, className }: PageShellProps) => {
  return (
    <section className={cn('space-y-6', className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0 mt-2 sm:mt-0">{actions}</div>}
      </div>
      {children}
    </section>
  );
};

export default PageShell;
