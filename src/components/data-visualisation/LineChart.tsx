'use client'

import { ChartData } from '@/dtos/data-visualisation/ChartData'
import { ChartOrientation } from '@/enums/ChartOrientation'
import { ChartUnit } from '@/enums/ChartUnit'
import { useRolledChartData } from '@/hooks/data-visualisation/useRolledChartData'

export type LineChartData<T> = {
    pointTitle?: (key: any) => string,
} & ChartData<T>

type LineChartParams = {
    data: LineChartData<any>
}

export default function LineChart({ data }: LineChartParams) {
    const { chartMap, keys, valuesScale } = useRolledChartData(data, ChartUnit.Count, ChartOrientation.Horizontal);
}