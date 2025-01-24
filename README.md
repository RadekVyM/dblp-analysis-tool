# dblp-analysis-tool

_dblp-analysis-tool_ is a web application developed for analyzing the [*dblp computer science bibliography*](https://dblp.org/). This project was undertaken as part of my Bachelor's thesis at [Palacký University Olomouc](https://www.inf.upol.cz/), supervised by [RNDr. Martin Trnečka, Ph.D.](http://trnecka.inf.upol.cz/) This repository contains both [the source code of the tool](/src/) and [the text of the Bachelor's thesis](/text/BP_Vymětalík.pdf).

## dblp computer science bibliography

*dblp computer science bibliography*, a leading publicly accessible database and web service, provides metadata of publications from various fields of computer science. This includes a vast collection from major journals and conference proceedings, as well as scientific monographs and encyclopedias. As of 2025, the database contains more than 7 million publications by over 3 million authors worldwide.

[![dblp.org](/images/dblp.png)](https://dblp.org/)

## Features
_dblp_ provides valuable data for many researchers and institutions. However, effectively understanding, comparing, tracking trends, and conducting analysis requires a clear and concise presentation of this data and its underlying relationships.

The _dblp-analysis-tool_ addresses this need by providing a user-friendly interface for visualizing and analyzing _dblp_ data. This tool allows users to:

- visualize author, journal, and conference statistics using various charts,
- browse and filter publication metadata,
- group authors, analyze their collective statistics, and perform basic analysis,
- explore co-authorship relationships through interactive, filterable graph,
- export analyzed data for further research and analysis.

## Showcase

These images highlight some of the key features of the application:

![Landing page](/images/landing_page.png)
*The application's home page*

![Search dialog](/images/search_dialog.png)
*The search dialog*

![Author page](/images/author_page_header.png)
*An author's page*

![Author page charts](/images/author_page_charts.png)
*Some of the charts available in the application*

![Coauthorship_graph](/images/coauthorship_graph.png)
*The co-authorship graph*

![Filter dialog](/images/filter_dialog.png)
*The filter dialog*

## Used technologies

This web application was developed primarily using the following technologies:

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [D3.js](https://d3js.org/)
- [Cheerio](https://cheerio.js.org/)
- [MongoDB](https://www.mongodb.com/)

## Running with Docker

To set up the application using Docker, you need to have the latest version of Docker installed along with Docker Compose. In the `src/` directory, there are two Docker Compose files:

- `docker-compose-dev.yml` – for local testing of the application in production mode (the application runs on port 3000).
- `docker-compose-prod.yml` – for deploying the application to production (the application runs on port 80).

Both files ensure the creation and launch of MongoDB and the application itself. The necessary environment variables and application ports are already predefined in these files.

The entire process of setting up the application is the same for both files:

1. Make sure you have Docker running on your machine.
2. In the terminal, navigate to the `src/` directory containing the mentioned files.
3. Build Docker containers using the desired file:

    ```
    docker compose -f ./docker-compose-dev.yml build
    ```

    Alternatively:

    ```
    docker compose -f ./docker-compose-dev.yml build --no-cache
    ```

4. Start the Docker containers for the desired file:

    ```
    docker compose -f ./docker-compose-dev.yml up
    ```

## Running without Docker

For development purposes, it's more suitable to run the application without Docker. In this case, you need to have a running MongoDB. I chose the [community version](https://www.mongodb.com/docs/manual/administration/install-community/), which can be installed locally. Additionally, you'll need [Node.js](https://nodejs.org/) installed along with the npm package manager.

The entire process of setting up the application:

1. Make sure you have Node.js and npm installed, and MongoDB running.

2. In the `src/` directory, create a `.env` file for environment variables.
    Add the `MONGODB_URI` variable with the database address, for example, for a locally running MongoDB:
    ```
    MONGODB_URI=mongodb://127.0.0.1:27017/dblp-tool
    ```
    You don’t need to create the database with the specified name (for example `dblp-tool`) beforehand on the database server.

3. In the terminal, navigate to the `src/` directory.

4. Install the necessary dependencies using the `npm install` command.

5. Start the application either in development or production mode:

    1. For development mode, run the application with:
        ```
        npm run dev
        ```

    2. To run the application in production mode, first build it:
        ```
        npm run build
        ```
        Then start the application with:
        ```
        npm run start
        ```

6. The address where the application is running will be displayed in the terminal.
