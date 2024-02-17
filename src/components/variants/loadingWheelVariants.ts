import { cva } from 'class-variance-authority'

/** All the possible variants of a loading element. */
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