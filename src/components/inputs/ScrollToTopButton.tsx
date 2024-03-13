'use client'

import { useEffect, useState } from 'react'
import Button from './Button'
import { MdArrowUpward } from 'react-icons/md'
import { cn } from '@/utils/tailwindUtils'
import { useIsClient } from 'usehooks-ts'

type ScrollToTopButtonParams = {
    className?: string
}

/** Button scrolls the page to the top. The button is shown if the user scrolls at least a half of the viewport height down. */
export default function ScrollToTopButton({ className }: ScrollToTopButtonParams) {
    const isClient = useIsClient();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const scrollEnded = (event: Event) => {
            setIsVisible(window.scrollY > window.innerHeight / 2);
        };

        window.addEventListener('scrollend', scrollEnded);

        return () => window.removeEventListener('scrollend', scrollEnded);
    }, []);

    function scrollToTop() {
        window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }

    return (
        <>
            {
                isClient &&
                <Button
                    onClick={() => scrollToTop()}
                    title='Scroll to top of the page'
                    className={cn('sticky mb-5 ml-auto bottom-5', isVisible ? 'animate-slideUpIn' : 'invisible', className)}>
                    <MdArrowUpward />
                </Button>
            }
        </>
    )
}