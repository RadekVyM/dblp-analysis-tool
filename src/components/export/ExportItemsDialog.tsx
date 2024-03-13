'use client'

import { forwardRef, useMemo } from 'react'
import { Dialog, DialogContent } from '@/components/dialogs/Dialog'
import DialogHeader from '@/components/dialogs/DialogHeader'
import DialogBody from '@/components/dialogs/DialogBody'
import Button from '@/components/inputs/Button'
import { MdGetApp } from 'react-icons/md'
import useTextFile from '@/hooks/useTextFile'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import useSavedVenues from '@/hooks/saves/useSavedVenues'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import useSelectableSavedItems from '@/hooks/useSelectableSavedItems'
import SavedItemsSelection from '@/components/export/SavedItemsSelection'
import { exportSavedItemsToJson } from '@/services/export/saves'

type ExportItemsDialogParams = {
    hide: () => void,
    animation: string,
}

/** Dialog for exporting saved authors, venues and author groups to JSON. */
const ExportItemsDialog = forwardRef<HTMLDialogElement, ExportItemsDialogParams>(({ hide, animation }, ref) => {
    const { savedAuthors } = useSavedAuthors();
    const { savedVenues } = useSavedVenues();
    const { authorGroups } = useAuthorGroups();
    const {
        selectedSavedAuthors, toggleSavedAuthor, toggleAllSavedAuthors,
        selectedSavedVenues, toggleSavedVenue, toggleAllSavedVenues,
        selectedAuthorGroups, toggleAuthorGroup, toggleAllAuthorGroups
    } = useSelectableSavedItems(savedAuthors, savedVenues, authorGroups);
    const exportedItems = useMemo(() => {
        return exportSavedItemsToJson(
            savedAuthors,
            savedVenues,
            authorGroups,
            selectedSavedAuthors,
            selectedSavedVenues,
            selectedAuthorGroups);
    }, [
        savedAuthors,
        savedVenues,
        authorGroups,
        selectedSavedAuthors,
        selectedSavedVenues,
        selectedAuthorGroups
    ]);
    const { file, textFileSize } = useTextFile(exportedItems);

    return (
        <Dialog
            ref={ref}
            animation={animation}
            hide={hide}
            className='dialog max-w-3xl max-h-[min(40rem,90%)] w-full h-full flex-dialog'>
            <DialogContent
                className='max-h-full flex-1 flex flex-col'>
                <DialogHeader
                    hide={hide}
                    heading={'Export Items'} />

                <DialogBody
                    className='py-2 flex-1 flex flex-col gap-y-4 overflow-auto thin-scrollbar'>
                    <SavedItemsSelection
                        savedAuthors={savedAuthors}
                        savedVenues={savedVenues}
                        authorGroups={authorGroups}
                        selectedSavedAuthors={selectedSavedAuthors}
                        selectedSavedVenues={selectedSavedVenues}
                        selectedAuthorGroups={selectedAuthorGroups}
                        toggleSavedAuthor={toggleSavedAuthor}
                        toggleSavedVenue={toggleSavedVenue}
                        toggleAuthorGroup={toggleAuthorGroup}
                        toggleAllSavedAuthors={toggleAllSavedAuthors}
                        toggleAllSavedVenues={toggleAllSavedVenues}
                        toggleAllAuthorGroups={toggleAllAuthorGroups} />
                </DialogBody>

                <footer
                    className='px-6 pb-6 pt-2 self-stretch flex'>
                    <span className='flex-1'>{textFileSize}</span>

                    <div
                        className='flex gap-x-2'>
                        <Button
                            href={file.url}
                            download={`dblp_analysis_tool_items.json`}
                            target='_blank'
                            className='items-center gap-x-2'>
                            <MdGetApp />
                            Download
                        </Button>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    )
});

ExportItemsDialog.displayName = 'ExportItemsDialog';
export default ExportItemsDialog;