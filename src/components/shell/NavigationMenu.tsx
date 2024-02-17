import { SEARCH_AUTHOR, SEARCH_VENUE } from '@/constants/urls'
import Link from 'next/link'

type NavMenuItem = {
    readonly title: string,
    readonly url: string,
}

/** Navigation menu that is displayed in the top header of the site. */
export default function NavigationMenu() {
    const items: Array<NavMenuItem> = [
        { title: 'Authors', url: SEARCH_AUTHOR },
        { title: 'Venues', url: SEARCH_VENUE },
    ];

    return (
        <nav
            className='flex'>
            <ul
                className='place-self-center flex gap-3 xs:gap-7 place-items-center'>
                {items.map(item =>
                    <li key={item.url}>
                        <Link
                            href={item.url}
                            prefetch={false}
                            className='text-sm'>
                            {item.title}
                        </Link>
                    </li>)}
            </ul>
        </nav>
    );
}