'use client'
import { cn } from '@/utils/tailwindUtils'
import { forwardRef } from 'react';

type InputParams = {
    label: React.ReactNode,
    error?: string | null,
    inputClassName?: string
} & React.InputHTMLAttributes<HTMLInputElement>

/** Form input with a label and error description. */
const Input = forwardRef<HTMLInputElement, InputParams>(({ label, id, error, className, inputClassName, ...rest }, ref) => {
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
            {error && <span className='text-xs text-danger'>{error}</span>}
        </div>
    )
});

Input.displayName = 'Input';

export default Input