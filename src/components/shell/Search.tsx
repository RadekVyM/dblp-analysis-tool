'use client'

import { cn } from '@/utils/tailwindUtils'
import { SearchDialog } from '../dialogs/SearchDialog'
import SearchBarButton from './SearchBarButton'
import useDialog from '@/hooks/useDialog'

type SearchParams = {
    className?: string
}

export default function Search({ className }: SearchParams) {
    const [searchDialog, isSearchDialogOpen, searchDialogAnimation, showSearchDialog, hideSearchDialog] = useDialog();

    return (
        <>
            <SearchBarButton
                className={cn('w-full', className)}
                onClick={() => showSearchDialog()} />

            <SearchDialog
                hide={hideSearchDialog}
                animation={searchDialogAnimation}
                isOpen={isSearchDialogOpen}
                ref={searchDialog} />
        </>
    )
}