import { signToken, verifyTokenFromCtx, verifyToken } from "../../utils/jwt.js";

export default async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    console.log("example headers", request.headers.authorization);
    try {
      const result = verifyToken(request.headers.authorization);
      reply.send(result);
    } catch (error) {
      reply.status(401).send({ message: error });
    }
  });
}
