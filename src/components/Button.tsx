import Link from 'next/link'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwindUtils'
import { buttonVariants } from './variants/buttonVariants'
import { HTMLAttributeAnchorTarget } from 'react'

export type ButtonParams = {
    href?: string,
    download?: string,
    target?: HTMLAttributeAnchorTarget
} &
    React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>

/** Button that can act as either a Link or an HTML button. */
export default function Button({ className, children, href, variant, size, title, download, target, disabled, ...props }: ButtonParams) {
    if (href) {
        return (
            <Link
                prefetch={false}
                title={title}
                href={href}
                download={download}
                target={target}
                className={cn(buttonVariants({ variant, size, className }), disabled ? 'pointer-events-none opacity-50' : '')}>
                {children}
            </Link>
        )
    }
    return (
        <button
            title={title}
            className={cn(buttonVariants({ variant, size, className }))}
            disabled={disabled}
            {...props}>
            {children}
        </button>
    )
}