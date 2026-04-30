import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Wallet } from "../../../../../types/Wallet";
import { CardItem } from "./CardItem";
import { cn } from "@/lib/utils";

interface SortableCardItemProps {
    card: Wallet;
    onEdit: (card: Wallet) => void;
    monthNet?: number;
}

export function SortableCardItem({ card, onEdit, monthNet }: SortableCardItemProps) {
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
            <CardItem card={card} onEdit={onEdit} monthNet={monthNet} />
        </div>
    );
}
