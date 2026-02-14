
import VisaIcon from "@/assets/card_icons/visa_logo.svg";
import MastercardIcon from "@/assets/card_icons/mastercard-logo.svg";
import EloIcon from "@/assets/card_icons/elo_logo.svg";
import AmexIcon from "@/assets/card_icons/amex_logo.svg";
import HipercardIcon from "@/assets/card_icons/hipercard_logo.svg";

export const CARD_FLAGS = [
    { name: "Visa", icon: VisaIcon },
    { name: "Mastercard", icon: MastercardIcon },
    { name: "Elo", icon: EloIcon },
    { name: "Amex", icon: AmexIcon },
    { name: "Hipercard", icon: HipercardIcon },
    { name: "Other", icon: null },
];

export const getCardFlagIcon = (flagName: string) => {
    const flag = CARD_FLAGS.find(f => f.name === flagName);
    return flag?.icon || null;
};
