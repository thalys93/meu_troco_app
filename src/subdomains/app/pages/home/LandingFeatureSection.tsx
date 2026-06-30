import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LandingScreenMockup, { LandingScreen } from './LandingScreenMockup';

interface LandingFeatureSectionProps {
    id: string;
    featureKey: string;
    screen: LandingScreen;
    reversed?: boolean;
}

const LandingFeatureSection: React.FC<LandingFeatureSectionProps> = ({
    id,
    featureKey,
    screen,
    reversed = false,
}) => {
    const { t } = useTranslation();
    const prefix = `landing_v3.features.${featureKey}`;
    const bullets = [1, 2, 3].map((n) => t(`${prefix}.bullet${n}`));

    const copy = (
        <motion.div
            initial={{ opacity: 0, x: reversed ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
        >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                {t(`${prefix}.title`)}{' '}
                <span className="text-primary">{t(`${prefix}.subtitle`)}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {t(`${prefix}.description`)}
            </p>
            <ul className="space-y-3">
                {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3 text-sm font-medium">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Check className="w-3.5 h-3.5" />
                        </span>
                        {bullet}
                    </li>
                ))}
            </ul>
        </motion.div>
    );

    const mockup = (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
            <LandingScreenMockup screen={screen} />
        </motion.div>
    );

    return (
        <section id={id} className="relative z-10 py-20 md:py-28 scroll-mt-20">
            <div className="container mx-auto px-4">
                <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto ${reversed ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                    {copy}
                    {mockup}
                </div>
            </div>
        </section>
    );
};

export default LandingFeatureSection;
