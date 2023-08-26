import fastifySwaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";

async function swaggerui(fastify, opts) {
  fastify.register(fastifySwaggerUi, {
    routePrefix: "/api/documentation",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: [fastify.basicAuth],
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
}

export default fp(swaggerui, {
  name: "swaggerui",
});
