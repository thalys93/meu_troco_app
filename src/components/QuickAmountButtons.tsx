import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickAmountButtonsProps {
    onSelect: (amount: number) => void;
}

const QuickAmountButtons: React.FC<QuickAmountButtonsProps> = ({ onSelect }) => {
    const quickAmounts = [10, 50, 100, 500, 1000];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
            {quickAmounts.map((amount) => (
                <Button
                    key={amount}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-background/40 hover:bg-accent/30 border border-accent/10 rounded-full px-4 text-xs font-medium whitespace-nowrap"
                    onClick={() => onSelect(amount)}
                >
                    +${amount}
                </Button>
            ))}
        </div>
    );
};

export default QuickAmountButtons;
