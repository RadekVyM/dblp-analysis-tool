import { cn } from '@/utils/tailwindUtils'
import { VariantProps } from 'class-variance-authority'
import Link, { LinkProps } from 'next/link'
import { listLinkVariants } from '@/components/variants/listLinkVariants'

type ListLinkParams = {
    className?: string,
    children?: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLAnchorElement> &
    LinkProps &
    VariantProps<typeof listLinkVariants>

/** Link component that should be used in lists. */
export default function ListLink({ className, surface, marker, size, ...rest }: ListLinkParams) {
    return (
        <Link
            {...rest}
            prefetch={false}
            className={cn(listLinkVariants({ surface, marker, size, className }))} />
    )
}