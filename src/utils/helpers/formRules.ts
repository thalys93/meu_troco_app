export const passwordRules = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
    minLength: /^.{8,}$/,
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;