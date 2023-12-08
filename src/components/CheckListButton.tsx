import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im'
import ListButton, { ListButtonParams } from './ListButton'
import { cn } from '@/utils/tailwindUtils'

type CheckListButtonParams = {
    children: React.ReactNode,
    isSelected: boolean
} & ListButtonParams

export default function CheckListButton({ children, isSelected, className, ...props }: CheckListButtonParams) {
    return (
        <ListButton
            {...props}
            role='checkbox'
            aria-checked={isSelected}
            marker='none'
            size='sm'
            surface='container'
            className={cn('flex-row items-center gap-2 text-start', className)}>
            {
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