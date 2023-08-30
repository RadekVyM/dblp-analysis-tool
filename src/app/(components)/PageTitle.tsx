import { cn } from '@/shared/utils/tailwindUtils'

type PageTitleParams = {
    subtitle?: string,
    className?: string,
    title: string
}

export default function PageTitle({ subtitle, title, className }: PageTitleParams) {
    return (
        <div
            className={cn('flex flex-col gap-1 pt-8 pb-6', className)}>
            {
                subtitle &&
                <small className='uppercase text-primary font-bold'>{subtitle}</small>
            }
            <h2 className='font-extrabold text-3xl'>{title}</h2>
        </div>
    )
}