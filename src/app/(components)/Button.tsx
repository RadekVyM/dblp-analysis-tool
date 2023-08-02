import Link from 'next/link'
import { VariantProps, cva } from 'class-variance-authority'
import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const buttonVariants = cva(
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

export interface ButtonProps extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    href?: string
}

export default function Button({ className, children, href, variant, size, ...props }: ButtonProps) {
    if (href) {
        return (
            <Link
                href={href}
                className={cn(buttonVariants({ variant, size, className }))}>
                {children}
            </Link>
        )
    }
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}>
            {children}
        </button>
    )
}