'use client'

import { cn } from '@/utils/tailwindUtils'
import { SearchDialog } from './SearchDialog'
import SearchBarButton from './SearchBarButton'
import useDialog from '@/hooks/useDialog'
import { Suspense } from 'react'

type SearchParams = {
    className?: string
}

/** Component that renders and manages the search bar button and search dialog. */
export default function Search({ className }: SearchParams) {
    const [searchDialog, isSearchDialogOpen, searchDialogAnimation, showSearchDialog, hideSearchDialog] = useDialog();

    //https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

    return (
        <Suspense>
            <SearchBarButton
                className={cn('w-full', className)}
                onClick={() => showSearchDialog()} />

            <SearchDialog
                hide={hideSearchDialog}
                animation={searchDialogAnimation}
                isOpen={isSearchDialogOpen}
                ref={searchDialog} />
        </Suspense>
    )
}