'use client'

import { PublicationPersonNodeDatum } from '@/dtos/graphs/PublicationPersonNodeDatum'
import { CoauthorsGraphWorkerData } from './CoauthorsGraph'
import * as d3 from 'd3'
import { PublicationPersonLinkDatum } from '@/dtos/graphs/PublicationPersonLinkDatum'

/*
Web worker that runs a simulation on the passed graph.
Positions of all nodes are found as a result of this simulation.
*/

const onmessage = (event: MessageEvent<CoauthorsGraphWorkerData>) => {
    const simulation = d3.forceSimulation<PublicationPersonNodeDatum>(event.data.nodes)
        .force('link', d3.forceLink<PublicationPersonNodeDatum, PublicationPersonLinkDatum>()
            .id((d) => d.person.id)
            .links(event.data.links))
        .force('charge', d3.forceManyBody().strength(-50))
        .force('center', d3.forceCenter(event.data.graphWidth / 2, event.data.graphHeight / 2))
        .stop();

    // The natural number of ticks when the simulation is started
    // See: https://d3js.org/d3-force/simulation#simulation_tick
    const n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));

    // Run the simulation manually to be able to watch progress
    for (let i = 0; i < n; ++i) {
        postMessage({ type: 'tick', progress: i / n });
        simulation.tick();
    }

    // Send the results back
    postMessage({ type: 'end', nodes: event.data.nodes, links: event.data.links });

    self.close();
};

addEventListener('message', onmessage);