'use client'

import { forwardRef, useEffect, useState } from 'react'
import { Dialog, DialogContent } from '../Dialog'
import DialogHeader from '../DialogHeader'
import DialogBody from '../DialogBody'
import Button from '../../Button'
import { MdGetApp } from 'react-icons/md'
import useTextFile from '@/hooks/useTextFile'
import useSavedAuthors from '@/hooks/saves/useSavedAuthors'
import useSavedVenues from '@/hooks/saves/useSavedVenues'
import useAuthorGroups from '@/hooks/saves/useAuthorGroups'
import CheckListButton from '@/components/CheckListButton'

type ExportItemsDialogParams = {
    hide: () => void,
    animation: string,
    isOpen: boolean,
}

type ItemsSectionParams = {
    items: Array<Item>,
    title: React.ReactNode,
    selectedItemIds: Set<string>,
    toggleItem: (id: string) => void,
}

type Item = { title: string, id: string };

const ExportItemsDialog = forwardRef<HTMLDialogElement, ExportItemsDialogParams>(({ hide, animation, isOpen }, ref) => {
    const { savedAuthors } = useSavedAuthors();
    const { savedVenues } = useSavedVenues();
    const { authorGroups } = useAuthorGroups();
    const { file, textFileSize } = useTextFile('');
    const [selectedSavedAuthors, toggleSavedAuthor] = useSelectedItems(savedAuthors);
    const [selectedSavedVenues, toggleSavedVenue] = useSelectedItems(savedVenues);
    const [selectedAuthorGroups, toggleAuthorGroup] = useSelectedItems(authorGroups);

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
                    <ItemsSection
                        items={savedAuthors}
                        selectedItemIds={selectedSavedAuthors}
                        toggleItem={toggleSavedAuthor}
                        title='Saved authors' />
                    <ItemsSection
                        items={authorGroups}
                        selectedItemIds={selectedAuthorGroups}
                        toggleItem={toggleAuthorGroup}
                        title='Author groups' />
                    <ItemsSection
                        items={savedVenues}
                        selectedItemIds={selectedSavedVenues}
                        toggleItem={toggleSavedVenue}
                        title='Saved venues' />
                </DialogBody>

                <footer
                    className='px-6 pb-6 pt-2 self-stretch flex'>
                    <span className='flex-1'>{textFileSize}</span>

                    <div
                        className='flex gap-x-2'>
                        <Button
                            href={'/'}
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

function ItemsSection({ items, selectedItemIds, title, toggleItem }: ItemsSectionParams) {
    return (
        <section>
            <header
                className='mb-1'>
                <CheckListButton
                    className='w-full'
                    isSelected={items.every((item) => selectedItemIds.has(item.id))}>
                    {title}
                </CheckListButton>
            </header>
            <ul
                className='flex flex-col gap-1 ml-5'>
                {items.map((item) => (
                    <li
                        key={item.id}>
                        <CheckListButton
                            className='w-full'
                            isSelected={selectedItemIds.has(item.id)}
                            onClick={() => toggleItem(item.id)}>
                            {item.title}
                        </CheckListButton>
                    </li>
                ))}
            </ul>
        </section>
    )
}

function useSelectedItems(defaultSelectedItems: Array<Item>): [Set<string>, (id: string) => void] {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    function toggleItem(id: string) {
        setSelectedItems((old) => {
            const newSet = new Set(old);

            if (newSet.has(id)) {
                newSet.delete(id);
            }
            else {
                newSet.add(id);
            }

            return newSet;
        });
    }

    useEffect(() => {
        setSelectedItems(new Set(defaultSelectedItems.map((item) => item.id)));
    }, [defaultSelectedItems]);

    return [selectedItems, toggleItem];
}