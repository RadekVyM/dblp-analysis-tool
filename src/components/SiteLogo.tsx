import Link from 'next/link'

export default function SiteLogo() {
    return (
        <Link
            href='/'
            className='flex place-items-center gap-3 xs:gap-5 with-logo'>
            <h1>
                <span className='block text-lg/6 font-extrabold'>dblp</span>
                <span className='block text-xs/3 text-on-surface-container-muted font-semibold whitespace-nowrap'>analysis tool</span>
            </h1>
        </Link>
    )
}