import { DblpPublication } from '@/shared/models/DblpPublication'
import { Section, SectionTitle } from './Section'
import Link from 'next/link'
import { PublicationTypesStats } from './PublicationsStats'

type PublicationsParams = {
    className?: string,
    publications: Array<DblpPublication>
}

export default function Publications({ publications, className }: PublicationsParams) {
    return (
        <Section>
            <SectionTitle className='text-xl'>Publications</SectionTitle>
            <ul className='flex flex-col gap-2 pl-4 mb-6'>
                {publications.slice(0, 5).map((publ) =>
                    <li
                        className='list-disc marker:text-primary'
                        key={publ.id}>
                        <div
                            className='inline-flex flex-col'>
                            <span>
                                <b>{publ.type}</b> {publ.title}
                            </span>
                            <span
                                className='text-xs'>
                                {publ.authors.map(a => <><Link href={a.url}>{a.name}</Link>, </>)}
                            </span>
                        </div>
                    </li>)}
            </ul>
            <PublicationTypesStats
                publications={publications.map((publ) => {
                    return {
                        id: publ.id,
                        type: publ.type,
                        date: publ.date
                    }
                })} />
        </Section>
    )
}