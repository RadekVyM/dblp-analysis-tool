import { cva } from 'class-variance-authority'

export const loadingWheelVariants = cva(
    'animate-spin inline-block border-current border-t-transparent rounded-full',
    {
        variants: {
            thickness: {
                default: 'border-4',
                xs: 'border-2',
                sm: 'border-3',
                lg: 'border-6',
            },
        },
        defaultVariants: {
            thickness: 'default',
        },
    }
)