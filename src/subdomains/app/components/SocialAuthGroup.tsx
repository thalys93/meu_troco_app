import React from 'react';
import { Button } from '@/components/ui/button';
import { useLoginWithGoogle } from '@/utils/api/auth';
import { GoogleLogo, FacebookLogo, AppleLogo, GithubLogo, TwitterLogoIcon, XLogo } from '@phosphor-icons/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const SocialButton = ({
    icon: Icon,
    onClick,
    label,
    disabled = false,
    className = ""
}: {
    icon: any,
    onClick?: () => void,
    label: string,
    disabled?: boolean,
    className?: string
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.div
                    whileHover={!disabled ? { scale: 1.1, y: -2 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                >
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onClick}
                        disabled={disabled}
                        className={`w-12 h-12 rounded-full border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:bg-background hover:border-primary/50 shadow-sm ${className} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                        <Icon weight="bold" className={`w-6 h-6 ${disabled ? 'text-muted-foreground' : 'text-foreground'}`} />
                    </Button>
                </motion.div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{disabled ? `${label} (Coming soon)` : label}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export function SocialAuthGroup() {
    const { t } = useTranslation();
    const loginGoogle = useLoginWithGoogle();

    const handleGoogleLogin = () => {
        loginGoogle.mutate();
    };

    return (
        <div className="flex items-center justify-center gap-4 py-2">
            <SocialButton
                icon={GoogleLogo}
                label={t('login.googleAuth')}
                onClick={handleGoogleLogin}
            />
            <SocialButton
                icon={FacebookLogo}
                label="Facebook"
                disabled
            />
            <SocialButton
                icon={AppleLogo}
                label="Apple"
                disabled
            />
            <SocialButton
                icon={XLogo}
                label="Twitter"
                disabled
            />
        </div>
    );
}

export default SocialAuthGroup;
