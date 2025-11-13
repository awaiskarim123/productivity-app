import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import env from "../config/env";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (fastify) => {
  fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_TOKEN_TTL,
    },
  });

  fastify.decorate(
    "authenticate",
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (error) {
        reply.code(401).send({ message: "Unauthorized" });
      }
    },
  );
});

