'use client'

import { useMemo } from 'react'
import * as d3 from 'd3'
import { ChartUnit } from '@/enums/ChartUnit'
import { ChartOrientation } from '@/enums/ChartOrientation'
import { ChartData } from '@/dtos/data-visualisation/ChartData'
import { ChartValue } from '@/dtos/data-visualisation/ChartValue'

/**
 * Hook that converts input data into data that are presentable in a 2D chart, such as bar, point or line chart.
 * @param data Input chart data
 * @param unit Unit in which chart values are displayed
 * @param orientation Orientation of the chart
 * @param maxKeysCount Maximum number of keys
 * @returns 
 */
export function useRolledChartData(data: ChartData<any>, unit: ChartUnit, orientation: ChartOrientation, maxKeysCount?: number) {
    // Chart map maps each examined property value to a count of items with that property value
    const chartMap = useMemo<d3.InternMap<any, ChartValue>>(
        () => {
            const rolled = d3.rollup(data.items, r => ({ value: r.length, items: r }), data.examinedProperty);

            if (unit === ChartUnit.Percentage) {
                const total = data.items.length;

                for (const key of rolled.keys()) {
                    const value = rolled.get(key);
                    if (total && value) {
                        value.value = value.value / total;
                    }
                }
            }

            return rolled;
        }, [data, unit]);
    const valuesScale = useMemo(
        () => d3.scaleLinear([0, getTopDomainValue()] as [number, number], [0, 1]),
        [chartMap, unit, orientation]);
    const keys = useMemo(
        () => {
            let rolledKeys = [...chartMap.keys()];
            if (data.fillMissingNumberKeys && rolledKeys.every((key) => typeof key === 'number')) {
                const min = d3.min(rolledKeys);
                const max = d3.max(rolledKeys);
                rolledKeys = d3.range(min, max + 1);
            }
            if (data.sortKeys) {
                rolledKeys.sort((key1, key2) => {
                    const value1 = chartMap.get(key1);
                    const value2 = chartMap.get(key2);

                    return data.sortKeys ? data.sortKeys({ key: key1, value: value1 }, { key: key2, value: value2 }) : 0;
                });
            }
            return maxKeysCount ? rolledKeys.slice(0, maxKeysCount) : rolledKeys;
        }, [chartMap, maxKeysCount]);

    function getTopDomainValue() {
        if (unit === ChartUnit.Percentage) {
            return 1;
        }

        const max = (d3.extent([...chartMap.values()].map((v) => v.value)) as [number, number])[1];
        const roundTo = max < 10 ? 1 : max < 100 ? 5 : 10;

        return Math.ceil(max / roundTo) * roundTo;
    }

    return { chartMap, keys, valuesScale };
}