'use client'

import { cn } from '@/utils/tailwindUtils'
import { forwardRef } from 'react'

interface DialogParams extends
    React.HTMLAttributes<HTMLDialogElement> {
    hide: () => void,
    animation: string,
    children: React.ReactNode,
    className?: string
}

type DialogContentParams = {
    children: React.ReactNode,
    className?: string
}

export const Dialog = forwardRef<HTMLDialogElement, DialogParams>(({ hide, animation, className, children, ...rest }, ref) => {
    return (
        <dialog
            {...rest}
            ref={ref}
            onClick={() => hide()}
            onCancel={(event) => {
                event.preventDefault();
                hide();
            }}
            className={cn(className, animation)}>
            {children}
        </dialog>
    )
});

Dialog.displayName = 'Dialog';

export function DialogContent({ className, children }: DialogContentParams) {
    return (
        <article
            className={className}
            onClick={(event) => event.stopPropagation()}>
            {children}
        </article>
    )
}