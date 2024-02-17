import Link from 'next/link'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwindUtils'
import { buttonVariants } from './variants/buttonVariants'

export type ButtonParams = {
    href?: string
} &
    React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>

/** Button that can act as either a Link or an HTML button. */
export default function Button({ className, children, href, variant, size, title, ...props }: ButtonParams) {
    if (href) {
        return (
            <Link
                prefetch={false}
                title={title}
                href={href}
                className={cn(buttonVariants({ variant, size, className }))}>
                {children}
            </Link>
        )
    }
    return (
        <button
            title={title}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}>
            {children}
        </button>
    )
}