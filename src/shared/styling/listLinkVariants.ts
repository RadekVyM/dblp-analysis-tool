import { cva } from 'class-variance-authority'

export const listLinkVariants = cva(
    `relative flex flex-col px-3 py-2 rounded-md transition-colors
     before:hidden before:absolute before:left-0 before:top-1/2 before:translate-y-[-50%]
     before:bg-primary before:w-1 before:h-4 before:rounded-sm`,
    {
        variants: {
            surface: {
                default: 'hover:bg-surface-dim',
                container: 'hover:bg-surface-dim-container',
            },
            marker: {
                'none': 'before:hidden hover:before:hidden',
                'onhover': 'hover:before:content-[""] hover:before:block',
                'visible': 'before:content-[""] before:block',
            }
        },
        defaultVariants: {
            surface: 'default',
            marker: 'onhover',
        },
        compoundVariants: [
            {
                surface: 'default',
                marker: 'visible',
                className: 'bg-surface-dim',
            },
            {
                surface: 'container',
                marker: 'visible',
                className: 'bg-surface-dim-container',
            },
        ]
    }
)