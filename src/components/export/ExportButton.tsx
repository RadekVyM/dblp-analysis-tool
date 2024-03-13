'use client'

import { MdGetApp } from 'react-icons/md'
import Button, { ButtonParams } from '@/components/inputs/Button'
import useTextFile from '@/hooks/useTextFile'
import { useMemo } from 'react'
import { cn } from '@/utils/tailwindUtils'
import { useIsClient } from 'usehooks-ts'

type ExportButtonParams = {
    exportedObject: any,
    fileName: string
} & ButtonParams

/** Button that exports an object to text file on click. */
export default function ExportButton({ exportedObject, children, className, fileName, disabled, ...rest }: ExportButtonParams) {
    const jsonObject = useMemo(() => JSON.stringify(exportedObject), [exportedObject]);
    const { file } = useTextFile(jsonObject);
    const isClient = useIsClient();

    return (
        <Button
            className={cn('items-center gap-x-2', className)}
            disabled={disabled}
            variant='outline'
            download={fileName}
            target='_blank'
            href={isClient ? file.url : undefined}
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