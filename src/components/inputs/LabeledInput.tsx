'use client'
import { cn } from '@/utils/tailwindUtils'
import { forwardRef } from 'react'

type LabeledInputParams = {
    label: React.ReactNode,
    inputClassName?: string
} & React.InputHTMLAttributes<HTMLInputElement>

/** Form input with a label. */
const LabeledInput = forwardRef<HTMLInputElement, LabeledInputParams>(({ label, id, className, inputClassName, ...rest }, ref) => {
    return (
        <div
            className={cn('flex flex-col gap-1 w-full', className)}>
            <label
                className='text-sm'
                htmlFor={id}>
                {label}
            </label>
            <input
                {...rest}
                id={id}
                ref={ref}
                className={cn('px-3 py-2 border border-outline rounded-md bg-surface-container', inputClassName)} />
        </div>
    )
});

LabeledInput.displayName = 'LabeledInput';

export default LabeledInput