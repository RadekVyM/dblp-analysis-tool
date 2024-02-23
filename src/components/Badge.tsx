import { cn } from '@/utils/tailwindUtils'

type BadgeParams = {
    title: string,
    children: React.ReactNode,
    className?: string
}

export default function Badge({ title, children, className }: BadgeParams) {
    return (
        <span
            title={title}
            className={cn('px-2 py-0.5 text-xs rounded-lg bg-secondary text-on-secondary', className)}>
            {children}
        </span>
    )
}