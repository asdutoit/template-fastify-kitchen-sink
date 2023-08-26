[![Node.js CI with Yarn](https://github.com/asdutoit/template-fastify-kitchen-sink/actions/workflows/node.js.yml/badge.svg)](https://github.com/asdutoit/template-fastify-kitchen-sink/actions/workflows/node.js.yml)

This Fastify Backend Template is a starting point for a backend application that uses Fastify, GraphQL, REST, and Prisma. You can using any Database that Prisma supports. This template is setup to use MongoDB. The `Getting Started` instructions below will guide on setting up a different DB, like Postgresql.

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

The following routes will be exposed:

- `GET /healthcheck` - Returns a 200 status code and response "OK" if the server is running
- `GET /graphiql` - GraphQL Playground. You need to set your ENV variable, GRAPHQLCLIENT to true to enable this route. Example: `GRAPHQLCLIENT=true`
- `POST /register` - Register a new user
- `GET /allusers` - Get all users (Auth Required) Add JWT obtained from `/register` route, to the `Authorization` header. Example: `Bearer eyJhb....`
- `GET /shipwrecks` - Get all shipwrecks (Auth Required) Add JWT obtained from `/register` route, to the `Authorization` header. Example: `Bearer eyJhb....`

The Redis cache expires by default in 10 seconds. This is set in the `/plugins/caching.js` file
If you wish to change this behaviour, change the value for `expiresIn: 100000`, to the desired value in milliseconds or set it in each individual API route file.
