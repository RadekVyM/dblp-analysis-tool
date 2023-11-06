import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im'
import ListButton from './ListButton'

type CheckListButtonParams = {
    children: React.ReactNode,
    isSelected: boolean,
    onClick: () => void
}

export default function CheckListButton({ children, isSelected, onClick }: CheckListButtonParams) {
    return (
        <ListButton
            role='checkbox'
            aria-checked={isSelected}
            marker='none'
            size='sm'
            surface='container'
            className='w-full flex-row items-center gap-2 text-start'
            onClick={onClick}>
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