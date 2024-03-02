type MaxCountInputParams = {
    label?: React.ReactNode,
    scaffoldId: string,
    maxCount: number,
    setMaxCount: (value: number) => void
}

/** Input for selecting maximum count of displayed chart items. */
export default function MaxCountInput({ scaffoldId, maxCount, label, setMaxCount }: MaxCountInputParams) {
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
                className='pl-2 ml-3 min-w-0 w-24 h-7 border border-outline rounded-md text-sm'
                value={maxCount}
                min={1}
                step={1}
                onChange={(e) => setMaxCount(parseInt(e.currentTarget.value))}
                type='number' />
        </div>
    )
}