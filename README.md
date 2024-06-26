# dblp-analysis-tool

*dblp-analysis-tool* is a tool for analyzing the [*dblp computer science bibliography*](https://dblp.org/). The tool was created as part of my bachelor’s thesis. This repository contains both [the source code of the tool](/src/) and [the text of the bachelor's thesis](/text/BP_Vymětalík.pdf) itself.

## dblp computer science bibliography

*dblp computer science bibliography*, also known as *dblp*, is a leading publicly accessible database and web service providing metadata of publications from various fields of computer science. It includes not only publications from many significant journals and conference proceedings but also scientific monographs and encyclopedias. As of 2024, the database contains more than 7 million publications by over 3 million authors worldwide. New data are continuously added to the database through a semi-automatic process under the supervision of the [Schloss Dagstuhl](https://www.dagstuhl.de/) research center, which strives to ensure the highest quality of these data. 

*dblp* provides valuable data for many researchers and institutions. However, for easier understanding, comparison, tracking trends, and overall analysis, it is beneficial to have the ability to clearly present this data and the relationships in them.

*dblp-analysis-tool* serves precisely these purposes. Using various types of charts, graphs and tables, it clearly presents data downloaded from the database, primarily metadata of authors, journals, and conferences.

The tool allows:

- visualizing statistics of authors, journals, or conferences using various types of charts,
- viewing publication metadata with the option of filtering,
- creating groups of authors, presenting their statistics, and performing simple analysis on them,
- visualizing co-authorship graphs with the option of filtering displayed authors based on various parameters,
- exporting analyzed data.

## Showcase

<div align="center">
    <img src="https://raw.githubusercontent.com/RadekVyM/MarvelousMAUI/main/images/images/landing_page.png"></img>
    <i>Landing page</i>
</div>

![Landing page](/images/landing_page.png)
<p align="center"><i>Landing page</i></p>

## Launch the app using Docker

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

## Launch the app without Docker

For development purposes, it's more suitable to run the application without Docker. In this case, you need to have a running MongoDB. I chose the [community version](https://www.mongodb.com/docs/manual/administration/install-community/), which can be installed locally. Additionally, you'll need [Node.js](https://nodejs.org/) installed along with the npm package manager.

The entire process of setting up the application:

1. Make sure you have Node.js and npm installed, and MongoDB running.

2. In the `src/` directory, create a `.env` file for environment variables.
    Add the MONGODB_URI variable with the database address, such as for a locally running MongoDB:
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