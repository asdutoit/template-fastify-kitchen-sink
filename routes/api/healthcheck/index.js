export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    request.log.info("healthcheck");
    return { healthcheck: "ok" };
  });
}
