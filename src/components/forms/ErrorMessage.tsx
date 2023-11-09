type ErrorMessageParams = {
    children: React.ReactNode
}

export default function ErrorMessage({ children }: ErrorMessageParams) {
    return (
        <span className='text-xs text-danger'>{children}</span>
    )
}