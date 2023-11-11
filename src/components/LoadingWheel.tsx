import { cn } from '@/utils/tailwindUtils'
import { VariantProps } from 'class-variance-authority'
import { loadingWheelVariants } from './variants/loadingWheelVariants'

type LoadingWheelParams = {
    className?: string
} &
    VariantProps<typeof loadingWheelVariants>

export default function LoadingWheel({ className, thickness }: LoadingWheelParams) {
    return (
        <div
            className={cn(loadingWheelVariants({ thickness }), 'w-4 h-4', className)}
            role='status'
            aria-label='loading'>
            <span className='sr-only'>Loading...</span>
        </div>
    )
}