import React, { useState, useEffect } from 'react';
import PrivateLayout from '../../layout/PrivateLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, TrendingUp, TrendingDown, Info, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useExchangeRate } from '@/hooks/useExchangeRate';


const CurrencyConverter = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: exchangeData, isLoading, isError, refetch, isFetching } = useExchangeRate();

    const rate = exchangeData?.bid || 5.80;

    const [brlValue, setBrlValue] = useState<string>('');
    const [usdValue, setUsdValue] = useState<string>('');
    const [isBrlFirst, setIsBrlFirst] = useState(true);
    const [lastEdited, setLastEdited] = useState<'brl' | 'usd'>('brl');

    useEffect(() => {
        if (lastEdited === 'brl' && brlValue !== '') {
            const val = parseFloat(brlValue) / rate;
            setUsdValue(isNaN(val) ? '' : val.toFixed(2));
        } else if (lastEdited === 'usd' && usdValue !== '') {
            const val = parseFloat(usdValue) * rate;
            setBrlValue(isNaN(val) ? '' : val.toFixed(2));
        }
    }, [brlValue, usdValue, rate, lastEdited]);

    const handleBrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastEdited('brl');
        setBrlValue(e.target.value.replace(/[^0-9.]/g, ''));
    };

    const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastEdited('usd');
        setUsdValue(e.target.value.replace(/[^0-9.]/g, ''));
    };

    const handleSwap = () => {
        setIsBrlFirst(!isBrlFirst);
    };

    const brlInput = (
        <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase ml-1">{t('converter.brl')}</Label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                <Input
                    name="brl_value"
                    type="text"
                    inputMode="decimal"
                    value={brlValue}
                    onChange={handleBrlChange}
                    placeholder="0,00"
                    className="h-16 pl-12 text-xl font-bold rounded-2xl bg-background/50 border-accent/10 focus-visible:ring-blue-500/30"
                />
            </div>
        </div>
    );

    const usdInput = (
        <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase ml-1">{t('converter.usd')}</Label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                <Input
                    name='usd_value'
                    type="text"
                    inputMode="decimal"
                    value={usdValue}
                    onChange={handleUsdChange}
                    placeholder="0,00"
                    className="h-16 pl-10 text-xl font-bold rounded-2xl bg-background/50 border-accent/10 focus-visible:ring-blue-500/30"
                />
            </div>
        </div>
    );

    return (
        <PrivateLayout>
            <div className="container mx-auto max-w-2xl mt-8 mb-20 px-4 md:px-6 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-full hover:bg-accent/10"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">{t('converter.title')}</h1>
                    </div>
                    {isFetching && !isLoading && (
                        <div className="flex items-center gap-2 text-[10px] text-blue-400 font-medium animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {t('converter.updating', 'Atualizando...')}
                        </div>
                    )}
                </div>

                <Card className="bg-background/40 border-accent/10 rounded-3xl overflow-hidden shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                            {t('converter.calculatorTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">

                        {/* Rate Info */}
                        <div className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-500",
                            isError ? "bg-red-500/5 border-red-500/20" : "bg-blue-500/5 border-blue-500/10"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl transition-colors",
                                    isError ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                )}>
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">{t('converter.currentRate')}</p>
                                    <p className="font-mono font-bold">
                                        {isLoading ? '---' : `1 USD = ${rate.toFixed(4)} BRL`}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                {isError ? (
                                    <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-[10px] text-red-400 hover:bg-red-500/10 h-7">
                                        Tentar novamente
                                    </Button>
                                ) : (
                                    <>
                                        <p className="text-[10px] text-muted-foreground">{t('converter.estimatedRate')}</p>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            (exchangeData?.pctChange || 0) >= 0 ? "text-emerald-500" : "text-red-500"
                                        )}>
                                            {exchangeData?.pctChange ? `${exchangeData.pctChange}%` : '+0.0%'} {t('converter.today')}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                            {isBrlFirst ? brlInput : usdInput}

                            {/* Swap Button (Desktop & Mobile) */}
                            <div className="flex flex-col items-center justify-center pt-2 md:pt-6">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleSwap}
                                    className="w-12 h-12 rounded-full bg-background border-accent/10 hover:bg-accent/5 shadow-md transition-all active:scale-90"
                                    title="Inverter ordem"
                                >
                                    <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </div>

                            {isBrlFirst ? usdInput : brlInput}
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-500/5 text-xs text-muted-foreground">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <p>{t('converter.disclaimer')}</p>
                                {exchangeData?.createDate && (
                                    <p className="text-[10px] opacity-60">
                                        Última atualização: {new Date(exchangeData.createDate).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-accent/20 hover:bg-accent/5"
                            onClick={() => {
                                setBrlValue('');
                                setUsdValue('');
                            }}
                        >
                            {t('converter.clear')}
                        </Button>

                    </CardContent>
                </Card>
            </div>
        </PrivateLayout>
    );
};

export default CurrencyConverter;
