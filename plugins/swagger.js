import fp from "fastify-plugin";
import swagger from "@fastify/swagger";

async function swaggerPlugin(fastify, opts, done) {
  fastify.register(swagger, {
    swagger: {
      info: {
        title: "Fastify API",
        description:
          "Building a blazing fast REST API with Node.js, MongoDB, Fastify and Swagger",
        version: "0.1.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      host: "localhost:3000",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "user", description: "User related end-points" },
        { name: "code", description: "Code related end-points" },
      ],
      definitions: {
        User: {
          type: "object",
          required: ["id", "email"],
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
      },
      securityDefinitions: {
        jwt: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
        },
      },
      security: [
        {
          jwt: [],
        },
      ],
    },
  });
}

export default fp(swaggerPlugin, {
  name: "swaggerPlugin",
});
