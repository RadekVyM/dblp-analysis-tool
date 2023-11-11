'use client'

import { useEffect, useState } from 'react'
import Button from './Button'
import { MdArrowUpward } from 'react-icons/md'
import { cn } from '@/utils/tailwindUtils'

type ScrollToTopButtonParams = {
    className?: string
}

export default function ScrollToTopButton({ className }: ScrollToTopButtonParams) {
    const [isClient, setIsClient] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const scrollEnded = (event: Event) => {
            setIsVisible(window.scrollY > window.innerHeight / 2);
        };

        window.addEventListener('scrollend', scrollEnded);

        return () => window.removeEventListener('scrollend', scrollEnded)
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
                    className={cn('sticky mb-5 ml-auto bottom-5', isVisible ? 'animate-slideUpIn' : 'invisible')}>
                    <MdArrowUpward />
                </Button>
            }
        </>
    )
}