export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    fastify.log.error("This is an error");
    reply.send({ status: "OK" });
  });
}
