import { PublicationPersonLinkDatum } from './PublicationPersonLinkDatum'
import { PublicationPersonNodeDatum } from './PublicationPersonNodeDatum'

export type CoauthorsGraphOptions = {
    originalLinksDisplayed: boolean,
    hoveredAuthorId: string | null,
    selectedAuthorId: string | null,
}

export type CoauthorsGraph = {
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    minCoauthoredPublicationsCount: number,
    maxCoauthoredPublicationsCount: number,
    minCoauthorsCount: number,
    maxCoauthorsCount: number,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    // Selected authors are saved to a stack to enable back navigation
    selectedCoauthorIdsStack: Array<string>,
    isSimulationRunning: boolean
} & CoauthorsGraphOptions