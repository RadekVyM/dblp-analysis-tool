import { cn } from '@/utils/tailwindUtils'
import { VariantProps } from 'class-variance-authority'
import { tabVariants } from './variants/tabVariants'

type TabsParams = VariantProps<typeof tabVariants> & {
    tabsId: string,
    items: Array<{ content: React.ReactNode, title?: string, badgeContent?: string, id: any }>,
    legend: string,
    selectedId: any,
    className?: string,
    setSelectedId: (id: any) => void
}

type TabParams = VariantProps<typeof tabVariants> & {
    tabsId: string,
    content: React.ReactNode,
    title?: string,
    badgeContent?: string,
    id: any,
    selectedId: any,
    onChange: (id: any) => void
}

export default function Tabs({ items, tabsId, legend, selectedId, setSelectedId, className, ...rest }: TabsParams) {
    return (
        <fieldset
            className={cn('flex flex-wrap gap-2 has-focus-visible-outline rounded-sm flex-row', className)}>
            <legend className='sr-only'>{legend}</legend>

            {items.map((item) =>
                <Tab
                    tabsId={tabsId}
                    content={item.content}
                    title={item.title}
                    badgeContent={item.badgeContent}
                    id={item.id}
                    selectedId={selectedId}
                    onChange={setSelectedId}
                    key={item.id}
                    {...rest} />
            )}
        </fieldset>
    )
}

function Tab({ tabsId, content, title, badgeContent, id, selectedId, onChange, size }: TabParams) {
    const elementId = `${id}-${tabsId}-tab-radio`;
    const isSelected = selectedId == id;

    return (
        <div
            className={cn(
                tabVariants({ size }),
                'relative isolate btn px-0 place-content-stretch cursor-pointer select-none focus-within:outline focus-within:outline-2',
                isSelected ? 'btn-default' : 'btn-outline')}
            onClick={() => onChange(id)}>
            <div
                className='cursor-pointer flex px-3'>
                <span>{content}</span>
                {
                    badgeContent &&
                    <span
                        className={cn('inline-block text-[0.5rem] leading-none ml-2 px-1.5 py-1 rounded-lg pointer-events-none',
                            isSelected ? 'bg-surface-dim-container text-on-surface-dim-container' : 'bg-secondary text-on-secondary')}>
                        {badgeContent}
                    </span>
                }
            </div>
            <input
                className='sr-only'
                title={title}
                type='radio'
                onChange={(event) => onChange(event.currentTarget.value)}
                value={id} checked={isSelected} />
        </div>
    )
}