import { ZoomTransform } from '@/hooks/useZoom'

type ZoomContainerParams = {
    children: React.ReactNode,
    zoomTransform: ZoomTransform
}

/** Container that can be put into an SVG and that can apply a zoom transform. */
export default function ZoomContainer({ children, zoomTransform }: ZoomContainerParams) {
    return (
        <g
            transform={`translate(${zoomTransform.x},${zoomTransform.y}) scale(${zoomTransform.scale})`}>
            {children}
        </g>
    )
}