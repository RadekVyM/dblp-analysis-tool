import { cva } from 'class-variance-authority'

/** All the possible variants of a link element that is placed in a list. */
export const listLinkVariants = cva(
    `relative flex flex-col items-start rounded-md transition-colors text-start
     before:hidden before:absolute before:left-0 before:top-1/2 before:translate-y-[-50%]
     before:bg-primary before:w-1 before:rounded-sm`,
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
            },
            size: {
                default: 'px-3 py-2 before:h-4',
                sm: 'px-3 py-1 text-sm before:h-3',
                xs: 'px-2 py-1 text-xs before:h-3',
            }
        },
        defaultVariants: {
            surface: 'default',
            marker: 'onhover',
            size: 'default',
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