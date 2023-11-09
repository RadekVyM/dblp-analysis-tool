import { cn } from '@/utils/tailwindUtils'

type FormParams = {
    children: React.ReactNode
} & React.FormHTMLAttributes<HTMLFormElement>

export default function Form({ className, children, ...props }: FormParams) {
    return (
        <form
            {...props}
            className={cn('flex flex-col gap-2 items-stretch', className)}>
            {children}
        </form>
    )
}