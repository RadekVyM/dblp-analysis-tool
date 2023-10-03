'use client'

import { forwardRef } from 'react'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/tailwindUtils'
import { buttonVariants } from './variants/buttonVariants';

export interface ClientButtonParams extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

export const ClientButton = forwardRef<HTMLButtonElement, ClientButtonParams>(({ className, children, variant, size, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}>
            {children}
        </button>
    )
});

ClientButton.displayName = 'ClientButton';