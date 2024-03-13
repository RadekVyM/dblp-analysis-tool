'use client'

importScripts('https://d3js.org/d3-collection.v1.min.js');
importScripts('https://d3js.org/d3-dispatch.v1.min.js');
importScripts('https://d3js.org/d3-quadtree.v1.min.js');
importScripts('https://d3js.org/d3-timer.v1.min.js');
importScripts('https://d3js.org/d3-force.v1.min.js');

/*
Web worker that runs the simulation on the passed graph.
Positions of all nodes are found as a result of this simulation.
*/

// 24. 02. 2024
// The simulation suddenly throws an error: timer.js:8 Uncaught ReferenceError: window is not defined
// I have just experimented with Docker, updated Next.js, removed node_modules folder and that is all
// 27. 02. 2024
// Fixed the problem thanks to this gist: https://gist.github.com/mbostock/01ab2e85e8727d6529d20391c0fd9a16

const onmessage = (event) => {
    const simulation = d3.forceSimulation(event.data.nodes)
        .force('link', d3.forceLink()
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