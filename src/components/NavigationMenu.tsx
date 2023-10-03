import { SEARCH_AUTHOR, SEARCH_VENUE } from '@/constants/urls'
import Link from 'next/link'

export default function NavigationMenu() {
    const items = [
        new NavMenuItem('Authors', SEARCH_AUTHOR),
        new NavMenuItem('Venues', SEARCH_VENUE),
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

class NavMenuItem {
    constructor(public title: string, public url: string) { }
}