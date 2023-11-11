import { cn } from "@/utils/tailwindUtils"

export interface OutlinedTextParams extends
    React.SVGTextElementAttributes<SVGTextElement> {
    children: React.ReactNode,
    className?: string
}

export default function OutlinedText({ children, className, ...rest }: OutlinedTextParams) {
    return (
        <>
            <text
                {...rest}
                strokeLinecap='round' strokeLinejoin='round'
                className={cn('stroke-white dark:stroke-black stroke-[4] select-none', className)}>
                {children}
            </text>

            <text
                {...rest}
                className={cn('fill-black dark:fill-white', className)}>
                {children}
            </text>
        </>
    )
}