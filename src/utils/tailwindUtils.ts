import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    // clsx filters out all falsy values
    // twMerge merges all strings without class conflicts
    return twMerge(clsx(inputs))
}

export function prependDashedPrefix(prefix: string, suffix: string) {
    return `${prefix}-${suffix}`
}