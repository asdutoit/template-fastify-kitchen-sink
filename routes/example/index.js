import { signToken, verifyTokenFromCtx, verifyToken } from "../../utils/jwt.js";

export default async function (fastify, opts) {
  fastify.get(
    "/",
    { onRequest: [fastify.authenticate] },
    async function (request, reply) {
      reply.send({ user: request.user });
    }
  );
}
