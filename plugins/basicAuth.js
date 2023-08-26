import fp from "fastify-plugin";
import crypto from "crypto";
import basicauth from "@fastify/basic-auth";

// perform constant-time comparison to prevent timing attacks
function compare(a, b) {
  a = Buffer.from(a);
  b = Buffer.from(b);
  if (a.length !== b.length) {
    // Delay return with cryptographically secure timing check.
    crypto.timingSafeEqual(a, a);
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

async function basicAuth(fastify, opts) {
  fastify.register(basicauth, {
    validate(username, password, req, reply, done) {
      let result = true;
      result = compare(username, process.env.BASIC_AUTH_USERNAME) && result;
      result = compare(password, process.env.BASIC_AUTH_PASSWORD) && result;
      if (result) {
        done();
      } else {
        done(new Error("Access denied"));
      }
    },
    authenticate: true,
  });
}

export default fp(basicAuth, { name: "basicAuth" });
