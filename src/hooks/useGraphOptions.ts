'use client'

import { GraphOptions } from '@/dtos/GraphOptions'
import { useReducer } from 'react'

export default function useGraphOptions() {
    return useReducer(
        (state: GraphOptions, newState: Partial<GraphOptions>) => ({
            ...state,
            ...newState,
        }),
        {
            originalLinksDisplayed: true
        }
    );
}