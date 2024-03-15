'use client'

import { useMediaQuery } from 'usehooks-ts'

/** Hook that returns whether the viewport width is larger than the mobile viewport width. */
export default function useIsNotMobileSize() {
    const isNotMobile = useMediaQuery('(min-width: 768px)');

    return isNotMobile;
}