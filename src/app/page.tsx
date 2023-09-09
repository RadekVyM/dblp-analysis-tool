import { CONF_DBLP_KEY, JOURNALS_DBLP_KEY, SERIES_DBLP_KEY } from '@/shared/constants/search'
import Button from './(components)/Button'
import { VenueType } from '@/shared/enums/VenueType'

export default function HomePage() {
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
            href='/search/author'>
            Authors
          </Button>
          <Button
            size='sm'
            variant='outline'
            href={`/search/venue?type=${VenueType.Journal}`}>
            Journals
          </Button>
          <Button
            size='sm'
            variant='outline'
            href={`/search/venue?type=${VenueType.Conference}`}>
            Conferences
          </Button>
          <Button
            size='sm'
            variant='outline'
            href={`/search/venue?type=${VenueType.Series}`}>
            Series
          </Button>
        </div>
      </div>
    </main>
  )
}
