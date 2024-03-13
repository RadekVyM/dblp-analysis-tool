import Button from '@/components/inputs/Button'
import { SEARCH_AUTHOR, SEARCH_VENUE } from '@/constants/urls'
import { VenueType } from '@/enums/VenueType'

/** Landing page. */
export default async function HomePage() {
    return (
        <main
            className='grid w-full h-full py-8'>
            <div
                className='place-self-center flex flex-col items-center gap-9'>
                <h2
                    className='font-black flex flex-col items-center text-center text-[min(8vw,3rem)]'>
                    Explore and Analyse <br />
                    <span className='text-primary font-black'>dblp</span>
                </h2>
                <p className='text-center max-w-xl'>
                    Computer science bibliography that provides open bibliographic information on major computer science journals and proceedings.
                </p>

                <div
                    className='mt-6 flex gap-3 flex-wrap justify-center'>
                    <Button
                        size='sm'
                        href={SEARCH_AUTHOR}>
                        Authors
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        href={`${SEARCH_VENUE}?type=${VenueType.Journal}`}>
                        Journals
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        href={`${SEARCH_VENUE}?type=${VenueType.Conference}`}>
                        Conferences
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        href={`${SEARCH_VENUE}?type=${VenueType.Series}`}>
                        Series
                    </Button>
                </div>
            </div>
        </main>
    )
}