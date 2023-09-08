export default async function (fastify, options) {
  fastify.get(
    "/",
    { perValidation: [fastify.authenticated] },
    async function (request, reply) {
      try {
        const users = await fastify.prisma.photos.findMany();
        reply.status(200).send(users);
      } catch (error) {
        console.error(error);
        reply.status(400).send("Something went wrong", error);
      }
    }
  );
}
