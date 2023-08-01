type VenuePageParams = {
    params: {
        id: String
    },
    searchParams: { [key: string]: number }
}

export default function VenuePage({ params: { id }, searchParams }: VenuePageParams) {
    console.log(searchParams);

    return (
        <main className="min-h-screen grid">
            <p className='w-[fit-content] relative place-self-center'>Hello Venue {id} page!</p>
        </main>
    )
}