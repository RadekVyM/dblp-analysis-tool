import { cn } from '@/utils/tailwindUtils'

type FormParams = {
    children: React.ReactNode
} & React.FormHTMLAttributes<HTMLFormElement>

/** Form that places elements in a column. */
export default function Form({ className, children, ...props }: FormParams) {
    return (
        <form
            {...props}
            className={cn('flex flex-col gap-2 items-stretch', className)}>
            {children}
        </form>
    )
}