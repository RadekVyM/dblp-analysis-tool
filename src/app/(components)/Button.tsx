import Link from 'next/link'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/tailwindUtils'
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
    'btn',
    {
        variants: {
            variant: {
                default:
                    'btn-default',
                destructive:
                    'btn-destructive',
                outline:
                    'btn-outline'
            },
            size: {
                default: 'btn-md',
                sm: 'btn-sm',
                lg: 'btn-lg',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonParams extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    href?: string
}

export default function Button({ className, children, href, variant, size, ...props }: ButtonParams) {
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