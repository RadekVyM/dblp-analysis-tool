'use client'

import { cn } from '@/utils/tailwindUtils'
import { forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { useIsClient } from 'usehooks-ts'

type DialogParams = {
    hide: () => void,
    animation: string,
    children: React.ReactNode,
    className?: string
} & React.HTMLAttributes<HTMLDialogElement>

type DialogContentParams = {
    children?: React.ReactNode,
    className?: string
}

export const Dialog = forwardRef<HTMLDialogElement, DialogParams>(({ hide, animation, className, children, ...rest }, ref) => {
    const isClient = useIsClient();

    return (
        <>
            {isClient && createPortal(
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
                </dialog>,
                document.body)}
        </>
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