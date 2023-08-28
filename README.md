[![Node.js CI with Yarn](https://github.com/asdutoit/template-fastify-kitchen-sink/actions/workflows/node.js.yml/badge.svg)](https://github.com/asdutoit/template-fastify-kitchen-sink/actions/workflows/node.js.yml)

This Fastify Backend Template is a starting point for a backend application that uses Fastify, GraphQL, REST, and Prisma. You can use any Database that Prisma supports. This template is setup to use MongoDB. The `Getting Started` instructions below will guide on setting up a different DB, like Postgresql.

<br />

## Prerequisites

1. You need a MongoDB Atlast db. Locally hosted MongoDB is not supported due to how Prisma connects to the db.
   You can also use other sql cloud hosted db services like Supabase, Planetscale, AWS RSA etc.
   > NOTE: If you are using anything other than MongoDB you will need to update the various files including the Prisma schema and route files accordingly.
2. You will need a Cloud hosted Redis DB or host one locally using Docker Desktop. You can download Docker Desktop [here](https://www.docker.com/products/docker-desktop). Once installed, run the following command in your terminal:
   `docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest`
   This will spin up a Redis Server as well as a Redis Workbench website to view the Redis cache. You can access the Redis Workbench at `http://localhost:8001/`
3. You need Node.js installed on your machine. You can download it [here](https://nodejs.org/en/download/). This template was built using Node.js v18. You can check your version by running `node -v` in your terminal.
4. Prisma is also required, but will be installed as part of the npm install script in the Getting Started section. For more information, visit: [Prisma ORM](https://www.prisma.io/)
5. Copy the `.env.example` file to `.env` and update the values to match your environment. You can use the default values for the MongoDB / Postgresql and Redis Stack database. If you are using a cloud hosted db service, you will need to update the values to match your environment:  
   `cp .env.example .env`
6. OPTIONAL: Seed the MongoDB database. Run the following command in your terminal:
   `node seed.js`

# Getting Started

1. Clone this repo to your local machine
2. Run `npm install` to install all dependencies
3. Copy ENV file `cp .env.example .env`
4. Update ENV file with your environment variables
5. Run `npx prisma db push` to ensure DB is up to date with Prisma Schema
6. OPTIONAL: Seed the database (Only for MongoDB). Run the following command in your terminal:
   `node seed.js`
7. Run `npm run dev` to start the server in development mode

<br />

# Testing

This template uses Mocha for testing.
Tests are located in the `test` folder.
You can run the tests by running the following command in your terminal:
`npm run test`

You can also run load tests to each route using any app you prefer. The test below was run using [Autocannon]('https://www.npmjs.com/package/autocannon)

```bash
$> autocannon -c 100 -p 10 -d 5 http://localhost:3000/healthcheck

Running 5s test @ http://localhost:3000/healthcheck
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬───────┬───────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max    │
├─────────┼───────┼───────┼───────┼───────┼──────────┼──────────┼────────┤
│ Latency │ 18 ms │ 23 ms │ 55 ms │ 69 ms │ 29.86 ms │ 12.36 ms │ 115 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴──────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┼─────────┤
│ Req/Sec   │ 31679   │ 31679   │ 32607   │ 34655   │ 32872   │ 997.24 │ 31677   │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┼─────────┤
│ Bytes/Sec │ 7.35 MB │ 7.35 MB │ 7.57 MB │ 8.04 MB │ 7.63 MB │ 232 kB │ 7.35 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 5

165k requests in 5.02s, 38.1 MB read
```

# Default Routes

The following routes will be exposed:

- `GET /healthcheck` - Returns a 200 status code and response "OK" if the server is running
- `GET /metrics` - Prometheus metrics endpoint
- `GET /graphiql` - GraphQL Playground. You need to set your ENV variable, GRAPHQLCLIENT to true to enable this route. Example: `GRAPHQLCLIENT=true`
- `POST /register` - Register a new user
- `GET /allusers` - Get all users (Auth Required) Add JWT obtained from `/register` route, to the `Authorization` header. Example: `Bearer eyJhb....`
- `GET /shipwrecks` - Get all shipwrecks (Auth Required) Add JWT obtained from `/register` route, to the `Authorization` header. Example: `Bearer eyJhb....`

The Redis cache expires by default in 10 seconds. This is set in the `/plugins/caching.js` file
If you wish to change this behaviour, change the value for `expiresIn: 100000`, to the desired value in milliseconds or set it in each individual API route file.

---

# Monitoring

The following template uses the `prom-client` package to expose Prometheus metrics. You can view the metrics by navigating to `http://localhost:3000/metrics`
A Docker-Compose file is included in the root of the project. You can run the following command to start the Prometheus and Grafana containers: `docker-compose up -d`

Note, the `prometheus` folder contains the `prometheus.yml` config file. This file is mounted to the Prometheus container and is used to scrape the metrics from the Fastify server.

The folder also contains a `web.yml` file which adds basic auth to your prometheus server. The default username and password is `admin` and `test`.

You can change this by updating the `web.yml` file. The password needs to be generated and encrypted using a tool like Bcrypt. You can use the following site to generate the password: [Bcrypt Generator](https://bcrypt-generator.com/)

You can then add the Prometheus datasource to Grafana using the following URL: `http://prometheus:9090` and add a new Dashboard.

You can use the following Dashboard template to get started: [Grafana Dashboard](https://grafana.com/grafana/dashboards/12230)

<br />

---

<br />

# Authentication

WORK IN PROGRESS

You can make a POST request to the graphql protected endpoint. The following endpoint requires a `ADMIN` role on the user account:
`curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d '{
  "query": "query { add(x: 3, y: 10) shipwrecks { coordinates, feature_type } }"
}' http://localhost:3000/graphql | jq .`

<br />

> **TODO**: Add middleware to rate limit requests

> **TODO**: Add auth middleware to routes (`/metrics`)

> **TODO**: ~~Add auth middleware to Prometheus~~
