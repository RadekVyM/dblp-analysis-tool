import { cn } from '@/utils/tailwindUtils'
import Tabs from '@/components/Tabs'
import DataVisualisationContainer from './DataVisualisationContainer'

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
    secondaryContent?: React.ReactNode,
    isHidden?: boolean
}

/** Shell for multiple data visualisation components that can be displayed based on the selected tab. */
export default function StatsScaffold({ className, items, scaffoldId, sideTabsLegend, onKeySelected, selectedKey }: StatsScaffoldParams) {
    const selectedItem = items.find((item) => item.key == selectedKey);
    const secondaryContent = selectedItem?.secondaryContent;

    return (
        <div
            className={cn(
                'grid sm:grid-cols-[1fr,auto] gap-3',
                secondaryContent ?
                    'grid-rows-[auto,1fr,auto] sm:grid-rows-[1fr,auto]' :
                    'grid-rows-[auto,1fr] sm:grid-rows-[1fr]',
                className)}>
            <Tabs
                className='self-start flex-wrap sm:flex-col sm:col-start-2 sm:col-end-3'
                tabsId={`${scaffoldId}-side-tabs`}
                legend={sideTabsLegend}
                items={items.filter((item) => !item.isHidden).map((item) => {
                    return {
                        id: item.key,
                        content: item.icon,
                        title: item.title
                    }
                })}
                selectedId={selectedKey}
                setSelectedId={(id) => onKeySelected(id)} />
            <DataVisualisationContainer
                className='overflow-clip min-h-0 sm:row-start-1 sm:row-end-2 sm:col-start-1 sm:col-end-2'>
                {selectedItem?.content}
            </DataVisualisationContainer>
            {
                secondaryContent &&
                <DataVisualisationContainer
                    className='row-start-3 row-end-4 sm:row-start-2 sm:row-end-3 sm:col-start-1 sm:col-end-2'>
                    {secondaryContent}
                </DataVisualisationContainer>
            }
        </div>
    )
}