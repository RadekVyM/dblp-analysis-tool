type ErrorMessageParams = {
    children: React.ReactNode
}

/** Error message that can be displayed in a form. */
export default function ErrorMessage({ children }: ErrorMessageParams) {
    return (
        <span className='text-xs text-danger'>{children}</span>
    )
}