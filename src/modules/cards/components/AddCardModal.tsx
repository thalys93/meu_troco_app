import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import useUserStore from "@/store/UserStore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardForm } from "../validators/card";
import { Card } from "../types/Card";
import { useCardsStore } from "../store/useCardsStore";
import { CARD_FLAGS } from "../utils/cardUtils";

interface AddCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cardToEdit?: Card | null;
}

const CARD_COLORS = [
    { name: "Black", value: "#000000" },
    { name: "Blue", value: "#2563eb" },
    { name: "Red", value: "#dc2626" },
    { name: "Green", value: "#16a34a" },
    { name: "Purple", value: "#9333ea" },
    { name: "Orange", value: "#ea580c" },
    { name: "Gray", value: "#4b5563" },
];

export function AddCardModal({ open, onOpenChange, cardToEdit }: AddCardModalProps) {
    const { t } = useTranslation();
    const { addCard, updateCard } = useCardsStore();
    const { user } = useUserStore();
    const [loading, setLoading] = useState(false);

    const form = useForm<CardForm>({
        defaultValues: {
            name: "",
            balance: 0,
            type: "debit",
            color: "#000000",
            flag: "Visa",
        }
    });

    useEffect(() => {
        if (open) {
            if (cardToEdit) {
                form.reset({
                    name: cardToEdit.name,
                    balance: cardToEdit.balance,
                    type: cardToEdit.type,
                    color: cardToEdit.color,
                    flag: cardToEdit.flag,
                });
            } else {
                form.reset({
                    name: "",
                    balance: 0,
                    type: "debit",
                    color: "#000000",
                    flag: "Visa",
                });
            }
        }
    }, [cardToEdit, open, form]);

    const onSubmit = async (data: CardForm) => {
        if (!user?.uid) return;
        setLoading(true);

        try {
            const cardData = {
                ...data,
                userId: user.uid,
            };

            if (cardToEdit) {
                await updateCard(cardToEdit.id, cardData);
            } else {
                await addCard(cardData as any);
            }
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {cardToEdit ? t('cards.editTitle', 'Editar Cartão') : t('cards.addTitle', 'Adicionar Cartão')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('cards.description', 'Preencha os dados do cartão abaixo.')}
                    </DialogDescription>
                </DialogHeader>

                <Form form={form} onSubmit={onSubmit} className="space-y-4 py-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('cards.name', 'Nome do Cartão')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={t('cards.namePlaceholder', 'Ex: Nubank, Inter...')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="balance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('cards.balance', 'Saldo / Limite')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('cards.type', 'Tipo')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="debit">{t('cards.types.debit', 'Débito / Conta')}</SelectItem>
                                        <SelectItem value="credit">{t('cards.types.credit', 'Crédito')}</SelectItem>
                                        <SelectItem value="voucher">{t('cards.types.voucher', 'Vale / Voucher')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="flag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('cards.flag', 'Bandeira')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Bandeira" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CARD_FLAGS.map((f) => (
                                                <SelectItem key={f.name} value={f.name}>
                                                    <div className="flex items-center gap-2">
                                                        {f.icon && <img src={f.icon} alt={f.name} className="w-8 h-auto object-contain" />}
                                                        <span>{f.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('cards.color', 'Cor')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Cor">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: field.value }} />
                                                        <span className="hidden sm:inline">Selected</span>
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {CARD_COLORS.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                                                        {c.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel', 'Cancelar')}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.save', 'Salvar')}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
