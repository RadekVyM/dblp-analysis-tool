type InputParams = {
    label: React.ReactNode,
    error?: string | null,
} & React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ label, id, error, ...rest }: InputParams) {
    return (
        <div
            className='flex flex-col gap-1 w-full'>
            <label
                className='text-sm'
                htmlFor={id}>
                {label}
            </label>
            <input
                {...rest}
                id={id}
                className='px-3 py-2 border border-outline rounded-md' />
            {error && <span className='text-xs text-danger'>{error}</span>}
        </div>
    )
}