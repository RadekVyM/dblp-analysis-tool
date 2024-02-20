import { ChartUnit } from '@/enums/ChartUnit'
import { useState } from 'react'

/** Hook that returns a state for selecting the chart unit. */
export default function useSelectedChartUnit() {
    return useState<ChartUnit>(ChartUnit.Count);
}