import { clamp } from "@/utils/numbers"

type CountInputParams = {
    label?: React.ReactNode,
    scaffoldId: string,
    count: number,
    maxCount?: number,
    setCount: (value: number) => void
}

/** Input for selecting maximum count of displayed chart items. */
export default function CountInput({ scaffoldId, count, maxCount, label, setCount }: CountInputParams) {
    return (
        <div
            className='self-center pr-3 inline text-right'>
            <label
                htmlFor={`${scaffoldId}-limit-input`}
                className='text-sm relative'>
                {label || 'Count:'}
            </label>
            <input
                id={`${scaffoldId}-limit-input`}
                className='pl-2 ml-3 min-w-0 w-24 h-7 border border-outline rounded-md text-sm bg-surface-container text-on-surface-container'
                value={count}
                min={1}
                max={maxCount}
                step={1}
                onChange={(e) => setCount(clamp(parseInt(e.currentTarget.value) || 1, 1, maxCount || Number.MAX_SAFE_INTEGER))}
                type='number' />
        </div>
    )
}