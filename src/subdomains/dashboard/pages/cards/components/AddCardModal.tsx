import { useEffect, useMemo, useState } from "react";
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
import { Loader2, Lock, Palette, UserRound, WalletCards } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WalletForm } from "../../../../../utils/validators/wallet";
import { Wallet } from "../../../../../types/Wallet";
import { useWalletsStore } from "../../../../../store/useWalletsStore";
import { CARD_FLAGS } from "../../../../../utils/cardUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AddCardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cardToEdit?: Wallet | null;
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
    const { addWallet, updateWallet } = useWalletsStore();
    const { user } = useUserStore();
    const [loading, setLoading] = useState(false);
    const linkedAccountName =
        cardToEdit?.accountName ||
        user?.displayName ||
        user?.fullName ||
        user?.email ||
        t("wallets.defaultLinkedAccount", "Conta principal");
    const linkedAvatar = user?.details?.avatar || "";
    const linkedAccountInitial = linkedAccountName.trim().charAt(0).toUpperCase() || "U";

    const form = useForm<WalletForm>({
        defaultValues: {
            name: "",
            accountName: linkedAccountName,
            balance: 0,
            type: "debit",
            color: "#000000",
            flag: "Visa",
        }
    });
    const selectedFlagName = form.watch("flag");
    const selectedFlag = useMemo(
        () => CARD_FLAGS.find((flag) => flag.name === selectedFlagName),
        [selectedFlagName]
    );

    const cardType = form.watch('type');    

    useEffect(() => {
        if (open) {
            if (cardToEdit) {
                form.reset({
                    name: cardToEdit.name,
                    accountName: cardToEdit.accountName,
                    balance: cardToEdit.balance,
                    type: cardToEdit.type,
                    color: cardToEdit.color,
                    flag: cardToEdit.flag,
                });
            } else {
                form.reset({
                    name: "",
                    accountName: linkedAccountName,
                    balance: 0,
                    type: "debit",
                    color: "#000000",
                    flag: "Visa",
                });
            }
        }
    }, [cardToEdit, open, form, linkedAccountName]);

    const onSubmit = async (data: WalletForm) => {
        if (!user?.uid) return;
        setLoading(true);

        try {
            const walletData: Omit<Wallet, "id"> = {
                name: data.name.trim(),
                accountName: linkedAccountName,
                balance: data.balance ?? 0,
                type: data.type ?? "debit",
                color: data.color ?? "#000000",
                flag: data.flag ?? "Visa",
                userId: user.uid,
            };

            if (cardToEdit) {
                await updateWallet(cardToEdit.id, walletData);
            } else {
                await addWallet(walletData);
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
                        {cardToEdit ? t('wallets.editTitle', 'Editar Carteira') : t('wallets.addTitle', 'Adicionar Carteira')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('wallets.description', 'Preencha os dados da carteira abaixo.')}
                    </DialogDescription>
                </DialogHeader>

                <Form form={form} onSubmit={onSubmit} className="space-y-4 py-4">
                    <div
                        className="rounded-xl p-4 text-white shadow-sm"
                        style={{ backgroundColor: form.watch("color") }}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-white/80">
                                    {t("wallets.preview", "Prévia")}
                                </p>
                                <p className="text-base font-semibold leading-tight">
                                    {form.watch("name") || t("wallets.namePlaceholder", "Ex: Carteira principal")}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-md bg-black/20 px-2 py-1 text-xs">
                                <WalletCards className="h-3.5 w-3.5" />
                                <span>{t(`wallets.types.${cardType}`, cardType)}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2 text-sm text-white/85">
                                {selectedFlag?.icon && (
                                    <img
                                        src={selectedFlag.icon}
                                        alt={selectedFlagName}
                                        className="h-4 w-auto object-contain"
                                    />
                                )}
                                <span>{selectedFlagName}</span>
                            </span>
                            <span className="text-xs text-white/80">
                                {linkedAccountName}
                            </span>
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('wallets.name', 'Nome da Carteira')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder={t('wallets.namePlaceholder', 'Ex: Carteira principal')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <FormLabel className="m-0">
                                {t("wallets.accountName", "Conta vinculada")}
                            </FormLabel>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Lock className="h-3.5 w-3.5" />
                                {t("wallets.linkedAccountLocked", "Bloqueado por enquanto")}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={linkedAvatar} alt={linkedAccountName} />
                                <AvatarFallback>{linkedAccountInitial}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{linkedAccountName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {t("wallets.linkedAccountHint", "Em breve: contas compartilhadas")}
                                </p>
                            </div>
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormField
                            control={form.control}
                            name="accountName"
                            render={({ field }) => (
                                <input type="hidden" {...field} value={linkedAccountName} />
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('wallets.type', 'Tipo')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="debit">{t('wallets.types.debit', 'Débito / Conta')}</SelectItem>
                                        <SelectItem value="credit">{t('wallets.types.credit', 'Crédito')}</SelectItem>
                                        <SelectItem value="voucher">{t('wallets.types.voucher', 'Vale / Voucher')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {(cardType === 'credit' || cardType === 'voucher') && (
                        <FormField
                            control={form.control}
                            name="balance"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('wallets.balance', 'Limite')}</FormLabel>
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
                    )}

                    <div className="rounded-lg border p-3">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <span>{t("wallets.visualIdentity", "Identidade visual")}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="flag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('wallets.flag', 'Bandeira')}</FormLabel>
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
                                    <FormLabel>{t('wallets.color', 'Cor')}</FormLabel>
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
