'use client'

import { useMemo } from 'react'

/**
 * Hook that creates a text file from a specified text.
 * @param text Text that is converted to a text file
 * @returns Text file and its size in a human readable format
 */
export default function useTextFile(text: string) {
    const file = useMemo(() => textToFile(text, 'text/plain'), [text]);

    return {
        file,
        textFileSize: fileSizeToText(file.size)
    };
}

function textToFile(text: string, type: string) {
    const file = new Blob([text], { type: type });
    return { url: URL.createObjectURL(file), size: file.size };
}

function fileSizeToText(bytes: number) {
    const kilo = bytes / 1024;

    if (kilo < 1024) {
        return kilo.toLocaleString(undefined, { style: 'unit', unit: 'kilobyte', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return (kilo / 1024).toLocaleString(undefined, { style: 'unit', unit: 'megabyte', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}