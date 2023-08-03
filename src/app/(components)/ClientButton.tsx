'use client'

import { forwardRef } from 'react'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cssClassUtils'
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
    'btn',
    {
        variants: {
            variant: {
                default:
                    'btn-default',
                destructive:
                    'btn-destructive',
                outline:
                    'btn-outline'
            },
            size: {
                default: 'btn-md',
                sm: 'btn-sm',
                lg: 'btn-lg',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

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