import { ChartUnit } from '@/enums/ChartUnit'
import Tabs from '../Tabs'

type ChartUnitSelectionParams = {
    unitsId: string,
    className?: string,
    selectedUnit: ChartUnit,
    setSelectedUnit: (unit: ChartUnit) => void
}

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
                    content: 'Publications Count',
                    id: ChartUnit.Count
                },
                {
                    content: '% of publications',
                    id: ChartUnit.Percentage
                }
            ]} />
    )
} 