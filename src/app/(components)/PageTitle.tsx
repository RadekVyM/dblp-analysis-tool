type PageTitleParams = {
    subtitle?: string,
    title: string
}

export default function PageTitle({ subtitle, title }: PageTitleParams) {
    return (
        <div
            className='flex flex-col gap-1 py-8'>
            {
                subtitle &&
                <small className='uppercase text-accent font-bold'>{subtitle}</small>
            }
            <h2 className='font-semibold text-3xl'>{title}</h2>
        </div>
    )
}