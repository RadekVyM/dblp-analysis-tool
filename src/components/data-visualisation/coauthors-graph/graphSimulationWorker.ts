'use client'

import { PublicationPersonNodeDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonNodeDatum'
import { CoauthorsGraphWorkerData } from './CoauthorsGraph'
import { PublicationPersonLinkDatum } from '@/dtos/data-visualisation/graphs/PublicationPersonLinkDatum'
import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3'

/*
Web worker that runs a simulation on the passed graph.
Positions of all nodes are found as a result of this simulation.
*/

// 24.02. 2024
// The simulation suddenly throws an error: timer.js:8 Uncaught ReferenceError: window is not defined
// I have just experimented with Docker, updated Next.js, removed node_modules folder and that is all

const onmessage = (event: MessageEvent<CoauthorsGraphWorkerData>) => {
    const simulation = forceSimulation<PublicationPersonNodeDatum>(event.data.nodes)
        .force('link', forceLink<PublicationPersonNodeDatum, PublicationPersonLinkDatum>()
            .id((d) => d.person.id)
            .links(event.data.links))
        .force('charge', forceManyBody().strength(-50))
        .force('center', forceCenter(event.data.graphWidth / 2, event.data.graphHeight / 2))
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