import Link from 'next/link'

export default function NavigationMenu() {
    const items = [
        new NavMenuItem('Authors', '/search/author'),
        new NavMenuItem('Venues', '/search/venue'),
    ];

    return (
        <nav
            className='flex'>
            <ul
                className='place-self-center flex gap-3 sm:gap-7 place-items-center'>
                {items.map(item => <li key={item.url}><Link href={item.url} className='text-sm'>{item.title}</Link></li>)}
            </ul>
        </nav>
    );
}

class NavMenuItem {
    constructor(public title: string, public url: string) { }
}