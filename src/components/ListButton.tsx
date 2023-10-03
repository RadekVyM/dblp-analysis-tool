import { cn } from '@/utils/tailwindUtils'
import { VariantProps } from 'class-variance-authority'
import { listLinkVariants } from './variants/listLinkVariants'

interface ListButtonParams extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof listLinkVariants> {
    className?: string,
    children?: React.ReactNode
}

export default function ListButton({ className, surface, marker, size, ...rest }: ListButtonParams) {
    return (
        <button
            {...rest}
            className={cn(listLinkVariants({ surface, marker, size, className }))} />
    )
}