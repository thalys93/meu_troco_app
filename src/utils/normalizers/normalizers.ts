/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';

export function normalizeDate(date: string | Date | undefined): string {
    if (!date) return '';
    return dayjs(date).format('DD/MM/YYYY, HH:mm');
}


export function normalizeShortDate(date: string | Date | undefined): string {
    if (!date) return '';
    return dayjs(date).format('DD/MM/YYYY');
}

export function normalizeToArray(input: string): string[] {
    return input
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

export function formatInputByType(type: string, input: string): any {
    switch (type) {
        case "array":
            return normalizeToArray(input);
        case "number":
        case "integer":
            return Number(input);
        case "object":
            try {
                return JSON.parse(input);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                return {};
            }
        case "boolean":
            return input.toLowerCase() === 'true';
        case "string":
            return input;
        case "null":
            return null;
    }
}

export function normalizeToString(input: any): string {
    if (input === null || input === undefined) {
        return '';
    }

    if (Array.isArray(input)) {
        return input.join(', ');
    }

    if (typeof input === 'object') {
        return JSON.stringify(input);
    }

    return String(input);
}
