import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im'
import ListButton, { ListButtonParams } from './ListButton'
import { cn } from '@/utils/tailwindUtils'

type CheckListButtonParams = {
    children: React.ReactNode,
    isSelected: boolean,
    disabledCheckmark?: React.ReactNode
} & ListButtonParams

/** List button that acts as a checkbox. */
export default function CheckListButton({ surface, children, isSelected, className, disabledCheckmark, disabled, ...props }: CheckListButtonParams) {
    return (
        <ListButton
            {...props}
            surface={surface || 'container'}
            role='checkbox'
            aria-checked={isSelected}
            disabled={disabled}
            marker='none'
            size='sm'
            className={cn('flex-row items-center gap-2 text-start', className)}>
            {
                disabled && disabledCheckmark ?
                    disabledCheckmark :
                    isSelected ?
                        <ImCheckboxChecked
                            className='w-3 h-3 flex-shrink-0' /> :
                        <ImCheckboxUnchecked
                            className='w-3 h-3 text-on-surface-dim-container-muted flex-shrink-0' />
            }
            {children}
        </ListButton>
    )
}