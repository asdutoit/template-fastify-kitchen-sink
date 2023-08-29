import path from "path";
import AutoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import fastifyPassport from "@fastify/passport";
import fs from "fs";
import fastifySecureSession from "@fastify/secure-session";
import Cors from "@fastify/cors";
import { verifyToken } from "./utils/jwt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pass --options via CLI arguments in command to enable these options.
export const options = {};

export default async function (fastify, opts) {
  await fastify.register(Cors, {
    origin: "*",
  });
  fastify.register(fastifySecureSession, {
    key: fs.readFileSync(path.join(__dirname, "secret-key")),
    cookie: {
      path: "/",
      httpOnly: false, // Set to true when deploying to production
      // signed: true,
      // secure: false, // Set to true when deploying to production
      // sameSite: true,
      // domain: "localhost",
    },
  });
  fastify.register(fastifyPassport.initialize());
  fastify.register(fastifyPassport.secureSession());
  fastify.decorate("authenticate", function (request, reply, next) {
    try {
      const result = verifyToken(request.headers.authorization);
      if (result) {
        request.user = { ...request.user, ...result };
        next();
      } else {
        reply.status(401).send({ message: "Unauthorized" });
      }
    } catch (error) {
      reply.status(401).send({ message: "Unauthorized" });
    }
  });
  const now = () => Date.now();

  fastify.addHook("onRequest", (request, reply, done) => {
    reply.startTime = now();
    request.log.info(
      {
        url: request.raw.url,
        id: request.id,
        headers: request.headers,
        key: "koos",
      },
      "received request"
    );
    done();
  });

  fastify.addHook("onResponse", (request, reply, done) => {
    request.log.info(
      {
        url: request.raw.url, // add url to response as well for simple correlating
        statusCode: reply.raw.statusCode,
        durationMs: now() - reply.startTime, // recreate duration in ms - use process.hrtime() - https://nodejs.org/api/process.html#process_process_hrtime_bigint for most accuracy
      },
      "request completed"
    );
    done();
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
}
