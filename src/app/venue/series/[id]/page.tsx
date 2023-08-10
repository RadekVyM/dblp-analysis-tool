export default function SeriesPage({ params: { id }, searchParams }: VenuePageParams) {
    return (
        <main className="min-h-screen grid">
            <p className='w-[fit-content] relative place-self-center'>Hello Venue {id} page!</p>
        </main>
    )
}