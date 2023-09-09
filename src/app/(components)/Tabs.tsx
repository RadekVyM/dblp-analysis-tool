import { tabVariants } from '@/shared/styling/tabVariants'
import { cn } from '@/shared/utils/tailwindUtils'
import { VariantProps } from 'class-variance-authority'

interface TabsParams extends VariantProps<typeof tabVariants> {
    tabsId: string,
    items: Array<{ content: React.ReactNode, title?: string, id: any }>,
    legend: string,
    selectedId: any,
    vertical?: boolean,
    className?: string,
    setSelectedId: (id: any) => void
}

interface TabParams extends VariantProps<typeof tabVariants> {
    tabsId: string,
    content: React.ReactNode,
    title?: string,
    id: any,
    selectedId: any,
    onChange: (id: any) => void
}

export default function Tabs({ items, tabsId, legend, selectedId, setSelectedId, vertical, className, ...rest }: TabsParams) {
    return (
        <fieldset
            className={cn('flex flex-wrap gap-2 has-focus-visible-outline rounded-sm', vertical ? 'flex-col' : 'flex-row', className)}>
            <legend className='sr-only'>{legend}</legend>

            {items.map((item) =>
                <Tab
                    tabsId={tabsId}
                    content={item.content}
                    title={item.title}
                    id={item.id}
                    selectedId={selectedId}
                    onChange={setSelectedId}
                    key={item.id}
                    {...rest} />
            )}
        </fieldset>
    )
}

function Tab({ tabsId, content, title, id, selectedId, onChange, size }: TabParams) {
    const elementId = `${id}-${tabsId}-tab-radio`;
    const isSelected = selectedId == id;

    return (
        <div
            className={cn(
                tabVariants({ size }),
                'btn px-0 place-content-stretch cursor-pointer select-none focus-within:outline focus-within:outline-2',
                isSelected ? 'btn-default' : 'btn-outline')}
            title={title}>
            <input
                className='sr-only'
                type='radio' id={elementId}
                onChange={(event) => onChange(event.currentTarget.value)}
                value={id} checked={isSelected} />
            <label
                className='cursor-pointer grid place-content-center px-3' htmlFor={elementId}><span>{content}</span></label>
        </div>
    )
}