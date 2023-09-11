import fastifyPassport from "@fastify/passport";
import bcrypt from "bcryptjs";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { signToken, verifyTokenFromCtx, verifyToken } from "../../utils/jwt.js";

fastifyPassport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // TODO: This is where you would save the user to a database.
      return done(null, profile);
    }
  )
);

fastifyPassport.registerUserDeserializer(async (user, req) => {
  return user;
});

fastifyPassport.registerUserSerializer(async (user, req) => {
  return user;
});

export default async function (fastify, opts) {
  // ========= Google OAuth2 =========
  fastify.get(
    "/google/login",
    {
      onRequest: async (request, reply) => {
        const originalUrl = request.query.redirectUrl || "/";
        fastify.redis.set("originalUrl", originalUrl, (err) => {
          if (err) {
            reply.send(err);
          }
        });
      },
    },
    fastify.googleAuthLogin()
  );

  fastify.get(
    "/google/callback",
    {
      preValidation: fastify.googleAuthCallback(),
    },
    async function (request, reply) {
      const value = await fastify.redis.get("originalUrl", (err, value) => {});
      const jwtToken = signToken({
        id: request.user.id,
        email: request.user.emails[0].value,
        name: request.user.displayName,
        picture: request.user.photos[0].value,
      });
      reply
        .setCookie("jwtToken", jwtToken, {
          path: "/",
        })
        .redirect(value);
    }
  );

  // ========= Email and Password =========
  fastify.post("/register", async function (request, reply) {
    try {
      const { email, password } = request.body;
      // TODO 1: Check if the user already exists (you should implement this logic)
      // If the user already exists, return an error or handle it as needed.

      // If the user does not exist, create the user.
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // TODO 2: Store the user information in your database (you should implement this logic)

      // Respond with a success message or any relevant data
      reply.send({
        message: "Registration successful",
        email,
        password: hashedPassword,
      });
    } catch (error) {
      fastify.log("Registration Failed", error);
      reply.status(500).send({ message: error });
    }
  });

  fastify.post("/login", async function (request, reply) {
    try {
      const { email, password } = request.body;
      try {
        console.log("prisma", await fastify.prisma.user.findMany());
      } catch (error) {
        console.log("error", error);
      }

      // TODO 1: Check if the user exists in DB and retrieve details (you should implement this logic)
      const user = {
        _id: "123",
        email: "koos@gmail.com",
        password:
          "$2b$10$mpjCaGU32QbuwDIwLBCADu31QEzA9pvuCqSh39RxltCeWtO/cKY8G",
        role: "USER",
      };
      if (!user) {
        reply.status(404).send({ message: "User not found" });
        return;
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        reply.status(401).send({ message: "Invalid password" });
        return;
      } else {
        // TODO 2: Generate JWT token and send it to the client (you should implement this logic)
        const jwtToken = signToken({
          id: user.id || user._id,
          email: user.email,
          name: user.name || "",
          picture: user.picture || "",
          role: user.role || "USER",
        });
        reply
          .setCookie("jwtToken", jwtToken, {
            path: "/",
          })
          .send({ message: "Login successful", jwtToken });
      }
    } catch (error) {}
  });

  fastify.get("/logout", async function (request, reply) {
    request.logout();
    const value = await fastify.redis.get("originalUrl", (err, value) => {});
    reply.redirect(value);
  });
}
