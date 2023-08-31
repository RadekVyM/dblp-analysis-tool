import { tabVariants } from '@/shared/styling/tabVariants'
import { cn } from '@/shared/utils/tailwindUtils'
import { VariantProps } from 'class-variance-authority'

interface TabsParams extends VariantProps<typeof tabVariants> {
    tabsId: string,
    items: Array<{ title: string, id: any }>,
    legend: string,
    selectedId: any,
    setSelectedId: (id: any) => void
}

interface TabParams extends VariantProps<typeof tabVariants> {
    tabsId: string,
    title: string,
    id: any,
    selectedId: any,
    onChange: (id: any) => void
}

export default function Tabs({ items, tabsId, legend, selectedId, setSelectedId, ...rest }: TabsParams) {
    return (
        <fieldset
            className='flex gap-2 has-focus-visible-outline rounded-sm'>
            <legend className='sr-only'>{legend}</legend>

            {items.map((item) =>
                <Tab
                    tabsId={tabsId}
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

function Tab({ tabsId, title, id, selectedId, onChange, size }: TabParams) {
    const elementId = `${id}-${tabsId}-tab-radio`;
    const isSelected = selectedId == id;

    return (
        <div
            className={cn(
                tabVariants({ size }),
                'btn px-0 place-content-stretch cursor-pointer select-none focus-within:outline focus-within:outline-2',
                isSelected ? 'btn-default' : 'btn-outline')}>
            <input
                className='sr-only'
                type='radio' id={elementId}
                onChange={(event) => onChange(event.currentTarget.value)}
                value={id} checked={isSelected} />
            <label
                className='cursor-pointer grid place-content-center px-3' htmlFor={elementId}><span>{title}</span></label>
        </div>
    )
}