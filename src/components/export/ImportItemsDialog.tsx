'use client'

import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent } from '../dialogs/Dialog'
import DialogHeader from '../dialogs/DialogHeader'
import DialogBody from '../dialogs/DialogBody'
import Button from '../inputs/Button'
import { MdOutlineUploadFile, MdUpload } from 'react-icons/md'
import { cn } from '@/utils/tailwindUtils'
import SavedItemsSelection from '@/components/export/SavedItemsSelection'
import useSelectableSavedItems from '@/hooks/useSelectableSavedItems'
import { SavedItem } from '@/dtos/saves/SavedItem'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import useSavedVenues from '@/hooks/saves/useSavedVenues'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import { AuthorGroup } from '@/dtos/saves/AuthorGroup'
import { SavedAuthor } from '@/dtos/saves/SavedAuthor'
import { SavedVenue } from '@/dtos/saves/SavedVenue'
import { retreiveValidSavedItems } from '@/services/export/saves'

type ImportItemsDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
}

/** Dialog for importing previously exported saved authors, venues and author groups to JSON. */
const ImportItemsDialog = forwardRef<HTMLDialogElement, ImportItemsDialogParams>(({ hide, animation, isOpen }, ref) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const { savedAuthors, savedVenues, authorGroups } = useItemsFromJson(fileContent);
    const {
        selectedSavedAuthors, toggleSavedAuthor, toggleAllSavedAuthors,
        selectedSavedVenues, toggleSavedVenue, toggleAllSavedVenues,
        selectedAuthorGroups, toggleAuthorGroup, toggleAllAuthorGroups
    } = useSelectableSavedItems(savedAuthors, savedVenues, authorGroups);
    const withFile = !!file;
    const canImport = selectedSavedAuthors.size > 0 || selectedSavedVenues.size > 0 || selectedAuthorGroups.size > 0;
    const importSavedItems = useImportSavedItems();

    useEffect(() => {
        file?.text().then((content) => setFileContent(content));
    }, [file]);

    useEffect(() => {
        setFile(null);
    }, [isOpen]);

    function onImportClick() {
        importSavedItems(
            savedAuthors.filter((a) => selectedSavedAuthors.has(a.id)),
            savedVenues.filter((v) => selectedSavedVenues.has(v.id)),
            authorGroups.filter((a) => selectedAuthorGroups.has(a.id)));

        hide();
    }

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
                    heading={'Import Items'} />

                <DialogBody
                    className='py-2 flex flex-col'>
                    <div
                        className={cn(
                            withFile ?
                                'mb-4' :
                                'grid flex-1')}>
                        {
                            !withFile &&
                            <div
                                className='border border-outline rounded-lg dropzone-file-area
                                    row-start-1 row-end-2 col-start-1 col-end-2
                                    flex flex-col items-center justify-center
                                    mb-4 w-full cursor-pointer'>
                                <MdOutlineUploadFile
                                    className='w-8 h-8 mb-4 text-on-surface-muted' />
                                <p
                                    className='mb-2 text-sm text-on-surface-muted'>
                                    <span className='font-semibold'>Click to upload</span> or drag and drop
                                </p>
                            </div>
                        }
                        <input
                            key={isOpen ? 'open' : 'closed'}
                            type='file'
                            accept='application/JSON'
                            className={withFile ?
                                `block w-full text-sm text-on-surface-muted
                                file:mr-4 file:py-1 file:px-3
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:cursor-pointer
                                file:bg-secondary file:text-on-secondary
                                hover:file:bg-secondary-dim hover:file:text-on-secondary-dim` :
                                'dropzone-file-input row-start-1 row-end-2 col-start-1 col-end-2 rounded-lg opacity-0 cursor-pointer'}
                            onChange={(e) => {
                                e.preventDefault();
                                const item = e.target.files?.item(0) || null;
                                setFile(item);
                            }} />
                    </div>

                    {
                        withFile &&
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
                    }
                </DialogBody>

                {
                    withFile &&
                    <footer
                        className='px-6 pb-6 pt-2'>
                        <Button
                            disabled={!canImport}
                            className='items-center gap-x-2 ml-auto'
                            onClick={onImportClick}>
                            <MdUpload />
                            Import
                        </Button>
                    </footer>
                }
            </DialogContent>
        </Dialog>
    )
});

ImportItemsDialog.displayName = 'ImportItemsDialog';
export default ImportItemsDialog;

function useItemsFromJson(json: string | null) {
    const jsonObj = useMemo(() => json ? JSON.parse(json) : {}, [json]);
    return useMemo(() => retreiveValidSavedItems(jsonObj), [jsonObj]);
}

function useImportSavedItems() {
    const { importAuthors } = useSavedAuthors();
    const { importVenues } = useSavedVenues();
    const { importAuthorGroups } = useAuthorGroups();

    function importSavedItems(
        savedAuthors: Array<SavedItem>,
        savedVenues: Array<SavedVenue>,
        authorGroups: Array<AuthorGroup>
    ) {
        importAuthors(savedAuthors);
        importVenues(savedVenues);
        importAuthorGroups(authorGroups);
    }

    return importSavedItems;
}