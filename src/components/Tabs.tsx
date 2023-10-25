import { cn } from '@/utils/tailwindUtils'
import { VariantProps } from 'class-variance-authority'
import { tabVariants } from './variants/tabVariants'
import Button from './Button'

type TabsParams = VariantProps<typeof tabVariants> & {
    tabsId: string,
    items: Array<{ content: React.ReactNode, title?: string, badgeContent?: string, id: any }>,
    legend: string,
    selectedId: any,
    className?: string,
    setSelectedId: (id: any) => void
}

type TabParams = VariantProps<typeof tabVariants> & {
    content: React.ReactNode,
    badgeContent?: string,
    id: any,
    selectedId: any,
    onChange: (id: any) => void
}

export default function Tabs({ items, tabsId, legend, selectedId, setSelectedId, className, ...rest }: TabsParams) {
    return (
        <div
            role='tablist'
            className={cn('flex flex-wrap gap-2 rounded-sm flex-row', className)}>
            {items.map((item) =>
                <Tab
                    content={item.content}
                    badgeContent={item.badgeContent}
                    id={item.id}
                    selectedId={selectedId}
                    onChange={setSelectedId}
                    key={item.id}
                    {...rest} />
            )}
        </div>
    )
}

function Tab({ content, badgeContent, id, selectedId, onChange, size }: TabParams) {
    const isSelected = selectedId == id;

    return (
        <Button
            role='tab'
            aria-controls={id}
            aria-selected={isSelected}
            className='isolate place-content-stretch'
            size={size}
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onChange(id)}>
            <span>{content}</span>
            {
                badgeContent &&
                <span
                    className={cn('inline-block text-[0.5rem] leading-none ml-2 px-1.5 py-1 rounded-lg pointer-events-none',
                        isSelected ? 'bg-surface-dim-container text-on-surface-dim-container' : 'bg-secondary text-on-secondary')}>
                    {badgeContent}
                </span>
            }
        </Button>
    )
}