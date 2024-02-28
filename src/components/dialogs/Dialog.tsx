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

/** Dialog element that can be hidden by clicking anywhere. Used in combination with DialogContent. */
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
                        if (!event.bubbles) {
                            // I want to hide the dialog only when the ESC key is pressed on the dialog.
                            // When the event bubbles, for example, from a file dialog,
                            // I do not want to hide the dialog.
                            hide();
                        }
                    }}
                    className={cn(className, animation)}>
                    {children}
                </dialog>,
                document.body)}
        </>
    )
});

Dialog.displayName = 'Dialog';

/** Container for a dialog content. This container ensures that if the content is clicked, the dialog is not hidden. */
export function DialogContent({ className, children }: DialogContentParams) {
    return (
        <article
            className={className}
            onClick={(event) => event.stopPropagation()}>
            {children}
        </article>
    )
}