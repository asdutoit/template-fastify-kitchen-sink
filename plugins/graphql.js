import fp from "fastify-plugin";
import mercurius from "mercurius";
import mercuriusCache from "mercurius-cache";
import mercuriusAuth from "mercurius-auth";
import { GraphQLError } from "graphql";
import { prismaForGraphQL } from "./prisma.js";
import { verifyToken } from "../utils/jwt.js";
import { schema } from "../graphql/schema.js";
import { resolvers } from "../graphql/resolvers.js";

async function graphqPlugin(fastify, opts, done) {
  const { redis } = fastify;

  fastify.register(mercurius, {
    schema,
    resolvers,
    subscription: true,
    context: async (request, reply) => {
      let userInfo = null;
      if (!request.headers.authorization) return { prismaForGraphQL, userInfo };
      userInfo = verifyToken(request.headers.authorization);
      return { prismaForGraphQL, userInfo };
    },
    graphiql: eval(process.env.GRAPHQLCLIENT),
  });
  fastify.addHook("onClose", () => redis.quit());
  fastify.register(mercuriusCache, {
    ttl: parseInt(process.env.CACHE_TTL) || 60,
    policy: {
      Query: {
        shipwrecks: true,
      },
    },
    storage: {
      type: "redis",
      options: {
        client: redis,
        closeClient: true,
        invalidation: {
          referenceTTL: 60,
        },
      },
    },
    onDedupe: function (type, fieldName) {
      fastify.log.info({ msg: "deduping", type, fieldName });
    },
    onHit: function (type, fieldName) {
      fastify.log.info({ msg: "cache hit", type, fieldName });
    },
    onSkip: function (type, fieldName) {
      fastify.log.info({ msg: "skipping cache", type, fieldName });
    },
    logInterval: 3600,
    logReport: (report) => {
      fastify.log.info({ msg: "cache stats" });
      console.table(report);
    },
  });
  // INFO: You can add some auth checks by uncommenting the following lines, but it does affect the performance of the graphql server
  // fastify.register(mercuriusAuth, {
  //   authContext: (context) => {
  //     const ROLE = context.userInfo.role || "UNKNOWN";
  //     return {
  //       identity: ROLE,
  //     };
  //   },
  //   async applyPolicy(authDirectiveAST, parent, args, context, info) {
  //     return context.auth.identity === "ADMIN";
  //   },
  //   authDirective: "auth",
  // });
  done();
}

export default fp(graphqPlugin, { name: "graphqPlugin" });
