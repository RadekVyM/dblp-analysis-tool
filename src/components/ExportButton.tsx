'use client'

import { MdGetApp } from 'react-icons/md'
import Button, { ButtonParams } from './Button'
import useTextFile from '@/hooks/useTextFile'
import { useMemo } from 'react'
import { cn } from '@/utils/tailwindUtils'

type ExportButtonParams = {
    exportedObject: any,
    fileName: string
} & ButtonParams

export default function ExportButton({ exportedObject, children, className, fileName, disabled, ...rest }: ExportButtonParams) {
    const jsonObject = useMemo(() => JSON.stringify(exportedObject), [exportedObject]);
    const { file } = useTextFile(jsonObject);

    return (
        <Button
            className={cn('items-center gap-x-2', className)}
            disabled={disabled}
            variant='outline'
            download={fileName}
            target='_blank'
            href={file.url}
            {...rest}>
            {
                children ||
                <>
                    <MdGetApp />
                    Export
                </>
            }
        </Button>
    )
}