"use strict";
import pino from "pino";

const loadNs = process.hrtime();
const loadMs = new Date().getTime();

function nanoseconds() {
  let diffNs = process.hrtime(loadNs);
  return BigInt(loadMs) * BigInt(1e6) + BigInt(diffNs[0] * 1e9 + diffNs[1]);
}

// Tested with pino-loki v2.03
const pinoLokiTransport = pino.transport({
  target: "pino-loki",
  options: {
    host: "http://localhost:3100", // Change if Loki hostname is different
    batching: false,
    labels: { application: "fastify-kitchen" },
  },
});
// Tested with pino v8.6.1
const pinoPretty = pino.transport({
  target: "pino-pretty",
  // options: {
  //   translateTime: "HH:MM:ss Z",
  //   ignore: "pid,hostname",
  // },
});

const transport = pino.transport({
  targets: [
    {
      target: "pino-loki",
      options: {
        host: "http://localhost:3100", // Change if Loki hostname is different
        batching: false,
        labels: { application: "fastify-kitchen" },
      },
    },
    {
      target: "pino-pretty",
    },
  ],
});

// Combine the streams
// NOTE: By setting the "level", you can choose what level each individual transport will recieve a log
const streams = [
  { level: "debug", stream: pinoLokiTransport },
  { level: "debug", stream: pinoPretty },
];

// Set up the Loki logger instance
// NOTE: By setting "level", you can set the globally "lowest" level that a transport will use
// let logger = pino(
//   {
//     level: "trace",
//   },
//   tranpinoLokiTransportsport
// );

const logger = pino(
  {
    // 👇 Will replace default pino timestamp with our custom one
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toLocaleString()}"`,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
  },
  pino.multistream(streams)
);

logger.info("Hello world!");
// Log message with custom tags to Loki
logger.info({ customTag: "BEEP BOOP" }, "Hello world with tags!");

// Workaround process exiting before logs are sent.
setTimeout(() => {}, 5000);
