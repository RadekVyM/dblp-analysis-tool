import { cn } from '@/shared/utils/tailwindUtils'
import Tabs from './Tabs'

type StatsScaffoldParams = {
    items: Array<StatsScaffoldItem>,
    scaffoldId: string,
    sideTabsLegend: string,
    selectedKey: any,
    onKeySelected: (key: any) => void,
    className?: string
}

type StatsScaffoldItem = {
    key: any,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
}

type StatsScaffoldItemMode = {

}

export default function StatsScaffold({ className, items, scaffoldId, sideTabsLegend, onKeySelected, selectedKey }: StatsScaffoldParams) {
    return (
        <div
            className={cn('grid grid-cols-[1fr,auto] gap-3', className)}>
            <div
                className='bg-surface-container rounded-lg border border-outline overflow-x-auto'>
                {items.find((item) => item.key == selectedKey)?.content}
            </div>
            <Tabs
                tabsId={`${scaffoldId}-side-tabs`}
                legend={sideTabsLegend}
                items={items.map((item) => {
                    return {
                        id: item.key,
                        title: item.icon
                    }
                })}
                selectedId={selectedKey}
                setSelectedId={(id) => onKeySelected(id)}
                vertical />
        </div>
    )
}