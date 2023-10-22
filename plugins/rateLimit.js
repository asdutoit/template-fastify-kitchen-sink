import rateLimit from "@fastify/rate-limit";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.register(rateLimit, {
    global: false,
    max: 3000,
    // allowList: ["10.0.0.1"],
    redis: fastify.redis,
    timeWindow: "1 minute",
  });
});
