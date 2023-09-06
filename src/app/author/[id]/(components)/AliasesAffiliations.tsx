import { DblpAuthorInfo } from '@/shared/models/DblpAuthor'
import { cn } from '@/shared/utils/tailwindUtils'

type AliasesAffiliationsParams = {
    info: DblpAuthorInfo,
    compact?: boolean
}

export default function AliasesAffiliations({ info, compact }: AliasesAffiliationsParams) {
    return (
        (info.aliases.length > 0 || info.affiliations.length > 0) &&
        <div>
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