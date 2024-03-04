import { cn } from '@/utils/tailwindUtils'

export interface OutlinedTextParams extends
    React.SVGTextElementAttributes<SVGTextElement> {
    children: React.ReactNode,
    className?: string
}

/** Outlined text element that can be put to an SVG. */
export default function OutlinedText({ children, className, ...rest }: OutlinedTextParams) {
    return (
        <>
            <text
                {...rest}
                strokeLinecap='round' strokeLinejoin='round'
                className={cn('stroke-surface stroke-[4] select-none', className)}>
                {children}
            </text>

            <text
                {...rest}
                className={cn('fill-on-surface', className)}>
                {children}
            </text>
        </>
    )
}