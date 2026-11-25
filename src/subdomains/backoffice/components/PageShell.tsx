import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PageShellProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const PageShell = ({ title, description, eyebrow, actions, children, className }: PageShellProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('space-y-6', className)}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
        <div>
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-widest text-primary mb-1">{eyebrow}</p>
          )}
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0 mt-2 sm:mt-0">{actions}</div>}
      </div>
      {children}
    </motion.section>
  );
};

export default PageShell;
