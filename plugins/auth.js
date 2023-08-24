import fp from "fastify-plugin";
import googleAuth from "@fastify/passport";

export default fp(async function (fastify, opts) {
  fastify.decorate("googleAuthLogin", function () {
    return googleAuth.authenticate("google", { scope: ["profile", "email"] });
  });
  fastify.decorate("googleAuthCallback", function () {
    return googleAuth.authenticate("google", { scope: ["profile", "email"] });
  });
});
