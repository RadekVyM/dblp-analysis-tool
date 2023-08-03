import { cva } from 'class-variance-authority'
import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const buttonVariants = cva(
    'grid place-content-center rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
    {
        variants: {
            variant: {
                default:
                    'bg-gray-800 text-white hover:bg-black dark:bg-gray-200 dark:text-black dark:hover:bg-gray-100',
                destructive:
                    'bg-red-700 text-white hover:bg-red-800 dark:hover:bg-red-700',
                outline:
                    'border bg-gray-50 text-black border-gray-300 hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800'
            },
            size: {
                default: 'h-10 px-4',
                sm: 'h-9 px-1',
                lg: 'h-11 px-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)