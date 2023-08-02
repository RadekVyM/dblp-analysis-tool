'use client'

import { forwardRef } from 'react'
import Button from './Button';

type SearchDialogParams = {
    onHide: () => void,
    onTestButtonClick: () => void,
    animation: string,
}

export const SearchDialog = forwardRef<HTMLDialogElement, SearchDialogParams>(({ onHide, onTestButtonClick, animation }, ref) => {
    return (
        <dialog
            id='search-view-dialog'
            ref={ref}
            className={`z-20 md:max-w-3xl w-full min-h-[25rem] bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-lg backdrop:backdrop-blur-md ${animation}`}
            onClick={(event) => {
                if ((event.target as HTMLElement)?.id !== 'search-view-dialog-content') {
                    onHide();
                }
            }}
            onCancel={(event) => {
                event.preventDefault();
                onHide();
            }}>
            <div
                id='search-view-dialog-content'>
                <Button
                    className='m-6' onClick={() => onHide()}>Close</Button>
                <Button
                    className='m-6' onClick={() => onTestButtonClick()}>
                    Author Page
                </Button>
            </div>
        </dialog>
    );
});