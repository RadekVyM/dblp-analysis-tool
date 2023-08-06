import { MdAutorenew } from "react-icons/md";

export default function Loading() {
    return (
        <main className="grid">
            <MdAutorenew
                className='place-self-center w-10 h-10 animate-spin text-gray-500' />
        </main>
    )
}