'use client'

import { useMediaQuery } from 'usehooks-ts'

export default function useIsNotMobileSize() {
    const isNotMobile = useMediaQuery('(min-width: 768px)');

    return isNotMobile;
}