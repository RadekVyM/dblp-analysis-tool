import { ChartUnit } from '@/enums/ChartUnit'
import Tabs from '@/components/Tabs'

type ChartUnitSelectionParams = {
    unitsId: string,
    className?: string,
    selectedUnit: ChartUnit,
    setSelectedUnit: (unit: ChartUnit) => void
}

/** Component for selecting currently used chart units. */
export default function ChartUnitSelection({ unitsId, className, selectedUnit, setSelectedUnit }: ChartUnitSelectionParams) {
    return (
        <Tabs
            className={className}
            size='xs'
            legend='Choose units'
            tabsId={unitsId}
            selectedId={selectedUnit}
            setSelectedId={setSelectedUnit}
            items={[
                {
                    content: 'Publications count',
                    id: ChartUnit.Count
                },
                {
                    content: '% of publications',
                    id: ChartUnit.Percentage
                }
            ]} />
    )
} 