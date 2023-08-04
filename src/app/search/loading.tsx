import { MdAutorenew } from "react-icons/md";

export default function LoadingSearchPage() {
    return (
        <main className="min-h-screen grid">
            <MdAutorenew
                className='place-self-center w-10 h-10 animate-spin text-gray-500' />
        </main>
    )
}