import fastifyPassport from "@fastify/passport";
import bcrypt from "bcryptjs";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { signToken, verifyTokenFromCtx, verifyToken } from "../../utils/jwt.js";
import { SharedUserSchema } from "./schemas.js";

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
  fastify.post(
    "/register",
    { schema: SharedUserSchema },
    async function (request, reply) {
      try {
        const { email, password } = request.body;

        if (!email || !password) {
          return reply
            .code(400)
            .send({ message: "Email and password are required" });
        }

        const existingUser = await fastify.prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (existingUser) {
          return reply.code(400).send({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await fastify.prisma.user.create({
          data: { email, password: hashedPassword, salt },
        });
        fastify.log.info(`User registered: ${email}`);
        reply.send({ message: "Registration successful", email });
      } catch (error) {
        fastify.log.error("Registration failed", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  fastify.post(
    "/login",
    { schema: SharedUserSchema },
    async function (request, reply) {
      try {
        const { email, password } = request.body;

        if (!email || !password) {
          return reply
            .code(400)
            .send({ message: "Email and password are required" });
        }

        const existingUser = await fastify.prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!existingUser) {
          reply.status(404).send({ message: "User not found" });
          return;
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          existingUser.password
        );

        if (!isPasswordValid) {
          reply.status(401).send({ message: "Invalid password" });
        } else {
          const jwtToken = signToken({
            id: existingUser.id || existingUser._id,
            email: existingUser.email,
            name: existingUser.name || "",
            picture: existingUser.picture || "",
            role: existingUser.role || "USER",
          });
          fastify.log.info(`User logged in successfully: ${email}`);
          reply
            .setCookie("jwtToken", jwtToken, {
              path: "/",
            })
            .send({ message: "Login successful", jwtToken });
        }
      } catch (error) {
        fastify.log.error("Login failed", error);
        reply.code(500).send({ message: "Internal server error" });
      }
    }
  );

  fastify.get("/logout", async function (request, reply) {
    request.logout();
    const value = await fastify.redis.get("originalUrl", (err, value) => {});
    reply.redirect(value);
  });
}
