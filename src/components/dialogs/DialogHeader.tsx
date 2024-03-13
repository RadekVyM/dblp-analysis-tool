import { MdClose } from 'react-icons/md'
import Button from '@/components/inputs/Button'

type DialogHeaderParams = {
    hide: () => void,
    heading: React.ReactNode,
    children?: React.ReactNode,
}

/** Header of a dialog that contains a heading and close button. Then it can contain any content you want. */
export default function DialogHeader({ hide, heading, children }: DialogHeaderParams) {
    return (
        <header
            className='flex flex-col gap-4 px-6 pt-6 pb-2 bg-inherit'>
            <div
                className='flex justify-between items-center'>
                <h2
                    className='text-xl font-semibold'>
                    {heading}
                </h2>

                <Button
                    title='Close'
                    variant='icon-outline'
                    onClick={() => hide()}
                    className='p-0'>
                    <MdClose
                        className='w-5 h-5' />
                </Button>
            </div>
            {children}
        </header>
    )
}