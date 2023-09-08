export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    reply.send({ status: "OK" });
  });
}
