// Read the .env file.
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import pino from "pino";

// Require the framework
import Fastify from "fastify";

// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from "close-with-grace";

// Import your application
import appService from "./app.js";

// Dotenv config
dotenv.config();

const pinoLokiTransport = pino.transport({
  target: "pino-loki",
  options: {
    host: "http://localhost:3100", // Change if Loki hostname is different
    labels: { application: "fastify-kitchen" },
  },
});

const pinoPretty = pino.transport({
  target: "pino-pretty",
  options: {
    translateTime: "HH:MM:ss Z",
    ignore: "pid,hostname",
    colorize: true,
    singleLine: true,
  },
});

const streams = [
  { level: "info", stream: pinoLokiTransport },
  { level: "debug", stream: pinoPretty },
];
const stream = [{ level: "info", stream: pinoLokiTransport }];

// TODO: May need to relook at this sometime in the future
const envToLogger = {
  development: {
    redact: ["headers.authorization", "headers.cookie"],
    stream: pino.multistream(streams),
    level: "trace",
  },
  production: {
    redact: ["headers.authorization", "headers.cookie"],
    stream: pino.multistream(stream),
  },
  test: false,
};

// Instantiate Fastify with some config
const app = Fastify({
  logger: envToLogger[process.env.NODE_ENV] ?? false,
  disableRequestLogging: true,
  genReqId(req) {
    return uuidv4();
  },
});

// Register your application as a normal plugin.
app.register(appService);

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace(
  { delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 },
  async function ({ signal, err, manual }) {
    if (err) {
      app.log.error(err);
    }
    await app.close();
  }
);

app.addHook("onClose", async (instance, done) => {
  closeListeners.uninstall();
  done();
});

// Start listening.
app.listen({ port: process.env.PORT || 3000 }, (err) => {
  console.log("Server listening at http://localhost:3000");
  console.log("ENV------: ", process.env.NODE_ENV);
  if (err) {
    app.log.info("Server listening...");
    app.log.error(err);
    process.exit(1);
  }
});
