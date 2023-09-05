import { cn } from '@/shared/utils/tailwindUtils'

type SectionTitleParams = {
    className?: string,
    children: React.ReactNode
}

export function Section({ children }: { children: React.ReactNode }) {
    return (
        <section className='mb-12'>{children}</section>
    )
}

export function SectionTitle({ children, className }: SectionTitleParams) {
    return (
        <h3 className={cn('mb-4 font-semibold', className)}>{children}</h3>
    )
}