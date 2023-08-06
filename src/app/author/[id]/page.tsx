type AuthorPageParams = {
    params: {
        id: String
    },
    searchParams: any
}

export default function AuthorPage({ params: { id }, searchParams }: AuthorPageParams) {
    return (
        <main className="min-h-screen grid">
            <p className='w-[fit-content] relative place-self-center'>Hello Aurhor {id} page!</p>
            <ul className='w-[fit-content] relative place-self-center'>
                {Object.entries(searchParams)
                    .map(([key, value]) => {
                        return <li>{key}: {value as String}</li>;
                    })}
            </ul>
        </main>
    )
}