'use client'

import { RefObject, useRef, useState } from 'react'

/** Hook that creates state objects for a dialog and related operations.  */
export default function useDialog():
    [RefObject<HTMLDialogElement>, boolean, string, () => void, () => void] {
    const [dialogAnimationClass, setDialogAnimationClass] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const showDialog = () => {
        setDialogAnimationClass('backdrop:animate-fadeIn animate-slideUpIn');
        dialogRef.current?.showModal();
        setIsDialogOpen(true);
    }

    const hideDialog = () => {
        setDialogAnimationClass('backdrop:animate-fadeOut animate-slideDownOut');
        const timeout = setTimeout(() => {
            dialogRef.current?.close();
            setIsDialogOpen(false);
            clearTimeout(timeout);
        }, 150);
    }

    return [dialogRef, isDialogOpen, dialogAnimationClass, showDialog, hideDialog];
}