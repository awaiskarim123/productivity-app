import fp from "fastify-plugin";
import { PrismaClient } from "../generated/prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (fastify) => {
  // PrismaClient will automatically read from prisma.config.ts
  const prisma = new PrismaClient();

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});

