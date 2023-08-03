import Link from 'next/link'
import { VariantProps } from 'class-variance-authority'
import { buttonVariants, cn } from '@/styling/buttonVariants'

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