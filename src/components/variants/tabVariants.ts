import { cva } from 'class-variance-authority'

export const tabVariants = cva(
    'btn',
    {
        variants: {
            size: {
                default: 'btn-md',
                xs: 'btn-xs',
                sm: 'btn-sm',
                lg: 'btn-lg',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    }
)