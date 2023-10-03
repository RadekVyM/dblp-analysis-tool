import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
    'btn',
    {
        variants: {
            variant: {
                default:
                    'btn-default',
                destructive:
                    'btn-destructive',
                outline:
                    'btn-outline',
                'icon-default':
                    'btn-default px-0 aspect-square',
                'icon-destructive':
                    'btn-destructive px-0 aspect-square',
                'icon-outline':
                    'btn-outline px-0 aspect-square'
            },
            size: {
                default: 'btn-md',
                xs: 'btn-xs',
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