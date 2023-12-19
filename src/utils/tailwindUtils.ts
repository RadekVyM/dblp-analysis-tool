import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes to one string and resolves all potential conflicts.
 * @param inputs List of Tailwind classes
 * @returns List of Tailwind classes merged to one string
 */
export function cn(...inputs: ClassValue[]) {
    // clsx filters out all falsy values
    // twMerge merges all strings without class conflicts
    return twMerge(clsx(inputs));
}

/**
 * Prepends a string with a prefix separated by a dash (-).
 * @param prefix 
 * @param suffix 
 * @returns Joined string
 */
export function prependDashedPrefix(prefix: string, suffix: string) {
    return `${prefix}-${suffix}`;
}