type InputParams = {
    id: string,
    type: string,
    name: string,
    label: React.ReactNode,
}

export default function Input({ type, name, label, id }: InputParams) {
    return (
        <div
            className='flex flex-col gap-1'>
            <label
                className='text-sm'
                htmlFor={id}>
                {label}
            </label>
            <input
                id={id}
                className='px-2 py-1 border border-outline rounded-md'
                type={type}
                name={name} />
        </div>
    )
}