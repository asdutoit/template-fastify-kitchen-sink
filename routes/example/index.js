import { signToken, verifyTokenFromCtx, verifyToken } from "../../utils/jwt.js";

const authenticate = async (request, reply) => {
  if (request.isAuthenticated()) {
    // User is authenticated (e.g., via Google OAuth)
    return;
  } else {
    // User is not authenticated via OAuth; check for credentials-based login
    const { email, password } = request.body;

    if (email && password) {
      // Check the credentials-based login here and set user if valid
      const user = await validateCredentials(email, password); // Implement this function to validate credentials

      if (user) {
        request.user = user;
        return;
      }
    }

    // If neither OAuth nor credentials-based login is successful
    reply.code(401).send({ message: "Unauthorized" });
  }
};

export default async function (fastify, opts) {
  fastify.get(
    "/",
    { onRequest: [fastify.authenticate] },
    // { preHandler: [fastify.authenticate] },
    async function (request, reply) {
      reply.send({ user: request.user });
    }
  );
}
