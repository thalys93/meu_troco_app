import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Wallet } from "../../../../../types/Wallet";
import { CardItem } from "./CardItem";
import { cn } from "@/lib/utils";

interface SortableCardItemProps {
    card: Wallet;
    onEdit: (card: Wallet) => void;
    onAdjust: (card: Wallet) => void;
    onDelete: (card: Wallet) => void;
    displayBalance: number;
    monthOutflow: number;
    monthLabel: string;
}

export function SortableCardItem({ card, onEdit, onAdjust, onDelete, displayBalance, monthOutflow, monthLabel }: SortableCardItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "cursor-grab active:cursor-grabbing touch-none",
                isDragging && "opacity-60 z-10 shadow-lg rounded-lg"
            )}
        >
            <CardItem
                card={card}
                onEdit={onEdit}
                onAdjust={onAdjust}
                onDelete={onDelete}
                displayBalance={displayBalance}
                monthOutflow={monthOutflow}
                monthLabel={monthLabel}
            />
        </div>
    );
}
