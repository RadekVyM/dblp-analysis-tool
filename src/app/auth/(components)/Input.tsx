type InputParams = {
    label: React.ReactNode,
} & React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ label, id, ...rest }: InputParams) {
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
        </div>
    )
}