'use client'

import { cn } from '@/utils/tailwindUtils'
import { useRef, useState } from 'react'
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md'
import ClientButton from './ClientButton'
import { useOnClickOutside } from 'usehooks-ts'

type ComboBoxParams = {
    id: string,
    items: Array<ComboBoxItem>,
    className?: string,
    selectedKey: string,
    onKeySelectionChange: (key: string) => void,
}

type ComboBoxItem = {
    key: string,
    label: string
}

/** Component for selecting single item from a collection of items which are displayed in a dropdown. */
export default function ComboBox({ items, className, id, selectedKey, onKeySelectionChange }: ComboBoxParams) {
    const divRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);
    useOnClickOutside(divRef, (e) => {
        setExpanded(false);
    }, 'mousedown');

    return (
        <div
            ref={divRef}
            className={cn('relative', className)}>
            <ClientButton
                variant='outline'
                className='w-full h-full flex justify-start'
                role='combobox'
                aria-labelledby='select button'
                aria-haspopup='listbox'
                aria-expanded={expanded}
                aria-controls={`${id}-select-dropdown`}
                onClick={() => setExpanded((old) => !old)}>
                <span className='flex-1 text-start'>{items.find((item) => item.key === selectedKey)?.label}</span>
                {
                    expanded ?
                        <MdArrowDropUp /> :
                        <MdArrowDropDown />
                }
            </ClientButton>
            <ul
                role='listbox'
                id={`${id}-select-dropdown`}
                className={cn(
                    'absolute w-full left-0 right-0 z-50 mt-2 max-h-56 flex flex-col p-2 gap-y-1',
                    'overflow-y-auto thin-scrollbar',
                    'rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
                    'bg-surface-container text-on-surface-container border border-outline shadow-lg',
                    expanded ? '' : 'invisible')}>
                {items.map((item) =>
                    <li
                        key={item.key}
                        role='option'
                        aria-selected={selectedKey === item.key}
                        className={cn(
                            selectedKey === item.key ? 'bg-surface-dim-container text-on-surface-dim-container' : '',
                            'flex rounded-md',
                            'focus-within:outline',
                            'focus-within:bg-surface-dim-container focus-within:text-on-surface-dim-container',
                            'hover:bg-surface-dim-container hover:text-on-surface-dim-container')}
                        onClick={(e) => {
                            if (e.type === 'click' && e.clientX !== 0 && e.clientY !== 0) {
                                setExpanded(false);
                            }
                        }}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                                setExpanded(false);
                            }
                        }}>
                        <input
                            className='sr-only'
                            type='radio'
                            id={`${id}-${item.key}-select-dropdown`}
                            value={item.key}
                            checked={selectedKey === item.key}
                            onChange={(e) => onKeySelectionChange(e.currentTarget.value)} />
                        <label
                            className='flex-1 py-2 px-2'
                            htmlFor={`${id}-${item.key}-select-dropdown`}>
                            {item.label}
                        </label>
                    </li>)}
            </ul>
        </div>
    )
}