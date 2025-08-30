# dblp-analysis-tool

_dblp-analysis-tool_ is a web application for analyzing the [*dblp computer science bibliography*](https://dblp.org/), built as part of a Bachelor's thesis at [Palacký University Olomouc](https://www.inf.upol.cz/), supervised by [RNDr. Martin Trnečka, Ph.D.](http://trnecka.inf.upol.cz/) The project enables researchers and institutions to visualize, explore, and analyze bibliographic metadata from dblp with a user-friendly interface.

> [!NOTE] 
> This repository contains both [the source code of the tool](/src/) and [the text of the Bachelor's thesis](/text/BP_Vymětalík.pdf).

## About dblp

The *dblp computer science bibliography* is a leading public database and web service providing metadata of publications in various fields of computer science. It includes a vast collection of journal articles, conference papers, and author profiles. As of 2025, the database contains more than 8 million publications by over 3 million authors worldwide.

[![dblp.org](/images/dblp.png)](https://dblp.org/)

## Features

_dblp_ provides valuable data for many researchers and institutions. However, effectively understanding, comparing, tracking trends, and conducting analysis requires a clear and concise presentation of this data and its underlying relationships.

_dblp-analysis-tool_ addresses this need by providing a user-friendly interface that allows:

- Visualize author, journal, and conference statistics using interactive charts
- Browse and filter publication metadata
- Group authors and analyze their collective statistics
- Explore co-authorship relationships through interactive, filterable graphs
- Export analyzed data for further research

## Showcase

Here are some highlights from the application:

![Landing page](/images/landing_page.png)

![Search dialog](/images/search_dialog.png)

![Author page](/images/author_page_header.png)

![Author page pier chart](/images/author_page_pie.png)

![Author page bar chart](/images/author_page_bar.png)

![Coauthorship_graph](/images/coauthorship_graph.png)

![Filter dialog](/images/filter_dialog.png)

![Venue page](/images/venue_page.png)

![Venue volumes](/images/venue_volumes.png)

## Technology Stack

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [D3.js](https://d3js.org/)
- [Cheerio](https://cheerio.js.org/)
- [MongoDB](https://www.mongodb.com/)

## Installation

You can run the application with or without Docker.

### Using Docker

> **Prerequisites:** Latest Docker and Docker Compose

1. Navigate to the `src/` directory containing the Docker Compose files:
    - `docker-compose-dev.yml` (local testing, port 3000)
    - `docker-compose-prod.yml` (production deployment, port 80)
2. Build containers:
    ```bash
    docker compose -f ./docker-compose-dev.yml build
    ```
    Or (for a clean build):
    ```bash
    docker compose -f ./docker-compose-dev.yml build --no-cache
    ```
3. Start containers:
    ```bash
    docker compose -f ./docker-compose-dev.yml up
    ```
4. The running address will be displayed in your terminal.

Both Compose files will create and launch MongoDB and the Next.js app. All needed environment variables and ports are predefined.

### Without Docker

> **Prerequisites:** Node.js, npm, and MongoDB (e.g. [community version](https://www.mongodb.com/docs/manual/installation/))

1. Ensure MongoDB is running.
2. In `src/`, create a `.env` file:
    ```
    MONGODB_URI=mongodb://127.0.0.1:27017/dblp-tool
    ```
    (No need to pre-create the database.)
3. Navigate to `src/` and install dependencies:
    ```bash
    npm install
    ```
4. Navigate to `src/` and start the application:
    - Development:
        ```bash
        npm run dev
        ```
    - Production (build and start):
        ```bash
        npm run build
        npm run start
        ```
5. The running address will be displayed in your terminal.
