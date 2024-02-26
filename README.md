# dblp-analysis-tool

Explore and analyse [dblp.org](https://dblp.org/) - computer science bibliography that provides open bibliographic information on major computer science journals and proceedings.

## Launch the app using Docker

In the root folder, where the `docker-compose-dev.yml` file is located, run:

```
docker compose --file ./docker-compose-dev.yml build
docker compose --file ./docker-compose-dev.yml up
```

The app is launched in production mode with predefined environment variables (in `docker-compose-dev.yml`) - this configuration is for testing purposes only.

## Launch the app without Docker

1. Install and launch the MongoDB database ([official documentation](https://www.mongodb.com/docs/manual/administration/install-community/)).

2. Install the newest Node.js.

3. In the `src/` folder run:

```
npm install
```

4. Create `.env` file in the `src/` folder with following variables:

```
MONGODB_URI=mongodb://127.0.0.1:27017/dblp-analysis-tool
SESSION_SECRET='super_secret_secret'
```

`SESSION_SECRET` can be an arbitrary string.

### Development with hot reload

To launch the app in development mode, run the following command in the `src/` folder:

```
npm run dev
```

### Production build

To launch the app in production mode, run the following commands in the `src/` folder:

```
npm run build
npm run start
```
