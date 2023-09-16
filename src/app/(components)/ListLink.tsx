import { listLinkVariants } from '@/shared/styling/listLinkVariants'
import { cn } from '@/shared/utils/tailwindUtils'
import { VariantProps } from 'class-variance-authority'
import Link, { LinkProps } from 'next/link'

interface ListLinkParams extends
    React.ButtonHTMLAttributes<HTMLAnchorElement>,
    LinkProps,
    VariantProps<typeof listLinkVariants> {
    className?: string,
    children?: React.ReactNode
}

export default function ListLink({ className, surface, marker, size, ...rest }: ListLinkParams) {
    return (
        <Link
            {...rest}
            prefetch={false}
            className={cn(listLinkVariants({ surface, marker, size, className }))} />
    )
}