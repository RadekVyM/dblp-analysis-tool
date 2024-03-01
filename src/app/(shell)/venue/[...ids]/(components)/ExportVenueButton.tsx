'use client'

import ExportButton from '@/components/ExportButton'
import { createPortal } from 'react-dom'
import { useIsClient } from 'usehooks-ts'

type ExportVenueButtonParams = {
    exportedObject: any,
    venueTitle: string,
    disabled?: boolean
}

/** Button that allows to export a venue to JSON. It is rendered using a portal. */
export default function ExportVenueButton({ exportedObject, venueTitle, disabled }: ExportVenueButtonParams) {
    const isClient = useIsClient();

    if (!isClient) {
        return undefined;
    }

    const exportButtonContainer = document.getElementById('export-venue-button-container');

    if (!exportButtonContainer) {
        return undefined;
    }

    return (
        createPortal(
            <ExportButton
                disabled={disabled}
                exportedObject={exportedObject}
                fileName={`${venueTitle}.json`} />,
            exportButtonContainer)
    )
}