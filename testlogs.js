"use strict";
import pino from "pino";

// Tested with pino-loki v2.03
const pinoLokiTransport = pino.transport({
  target: "pino-loki",
  options: {
    host: "http://localhost:3100", // Change if Loki hostname is different
    batching: false,
    labels: { application: "test-application-without-web" },
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

// Combine the streams
// NOTE: By setting the "level", you can choose what level each individual transport will recieve a log
const streams = [
  { level: "debug", stream: pinoLokiTransport },
  { level: "debug", stream: pinoPretty },
];

// Set up the Loki logger instance
// NOTE: By setting "level", you can set the globally "lowest" level that a transport will use
let logger = pino({ level: "trace" }, pino.multistream(streams));

logger.info("Hello world!");
// Log message with custom tags to Loki
logger.info({ customTag: "BEEP BOOP" }, "Hello world with tags!");

// Workaround process exiting before logs are sent.
setTimeout(() => {}, 5000);
