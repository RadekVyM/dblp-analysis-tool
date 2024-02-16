import { PublicationPersonLinkDatum } from './PublicationPersonLinkDatum'
import { PublicationPersonNodeDatum } from './PublicationPersonNodeDatum'

/** Properties that determine which coauthors graph nodes should be visible or highlighted. */
export type CoauthorsGraphOptions = {
    hoveredAuthorId: string | null,
    selectedAuthorId: string | null,
    filteredAuthorsIds: Set<string>,
    searchQuery: string,
} & CoauthorsGraphDisplayOptions

/** Properties that modify a visualization of a coauthors graph. */
export type CoauthorsGraphDisplayOptions = {
    originalLinksDisplayed: boolean,
    justDimInvisibleNodes: boolean,
    showNeighborLabelsOfHighlightedNodes: boolean,
    alwaysShowLabelsOfOriginalAuthorsNodes: boolean,
}

/**
 * Represents a state of a coauthors graph.
 * Stores all properties needed to visualize a coauthors graph and modify this visualization.
 */
export type CoauthorsGraphState = {
    nodes: Array<PublicationPersonNodeDatum>,
    links: Array<PublicationPersonLinkDatum>,
    minCoauthoredPublicationsCount: number,
    maxCoauthoredPublicationsCount: number,
    minCoauthorsCount: number,
    maxCoauthorsCount: number,
    authorsMap: Map<string, PublicationPersonNodeDatum>,
    // Selected authors are saved to a stack to enable back navigation
    selectedCoauthorIdsStack: Array<string>,
} & CoauthorsGraphOptions