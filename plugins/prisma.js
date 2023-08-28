import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

const prismaPlugin = fp(async (server, options) => {
  try {
    const prisma = new PrismaClient();

    await prisma.$connect();

    server.decorate("prisma", prisma);
    server.log.info({ actor: "MongoDB" }, "connected");

    server.addHook("onClose", async (server) => {
      await server.prisma.$disconnect();
    });
  } catch (error) {
    server.log.error({ actor: "MongoDB" }, "disconnected");
  }
});

const prismaForGraphQL = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prismaForGraphQL;

export { prismaForGraphQL };
export default prismaPlugin;
