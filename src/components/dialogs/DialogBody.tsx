import { cn } from '@/utils/tailwindUtils'

type DialogBodyParams = {
    children?: React.ReactNode,
    className?: string
}

/** Scrollable body of a dialog. */
export default function DialogBody({ children, className }: DialogBodyParams) {
    return (
        <div
            className={cn('px-6 py-5 overflow-y-auto h-full flex-1 thin-scrollbar', className)}>
            {children}
        </div>
    )
}