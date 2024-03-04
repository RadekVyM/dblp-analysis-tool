import { DblpAuthorInfo } from '@/dtos/DblpAuthor'
import { cn } from '@/utils/tailwindUtils'

type AliasesAffiliationsParams = {
    info: DblpAuthorInfo,
    compact?: boolean,
    className?: string
}

/** Displays all aliases and affiliations of an author. */
export default function AliasesAffiliations({ info, compact, className }: AliasesAffiliationsParams) {
    return (
        (info.aliases.length > 0 || info.affiliations.length > 0) &&
        <div
            className={className}>
            {
                info.aliases.length > 0 &&
                <dl className='inline'>
                    <dt className={cn('inline font-semibold', compact ? 'hidden' : '')}>Alias: </dt>
                    <dd className='inline'>{info.aliases.map((a) => a.title).join(' / ')}</dd>
                </dl>
            }
            {
                info.affiliations.length > 0 &&
                <ul>
                    {info.affiliations.map((affiliation) =>
                        <li
                            key={affiliation}
                            className={compact ? 'text-xs text-on-surface-muted' : 'text-sm'}>
                            {affiliation}
                        </li>)}
                </ul>
            }
        </div>
    )
}