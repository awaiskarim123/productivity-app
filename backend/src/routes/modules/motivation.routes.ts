import type { FastifyInstance } from "fastify";
import { motivationalQuotes } from "../../data/quotes";

export default async function motivationRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/quote", async () => {
    const quoteCount = await app.prisma.quote.count({
      where: { isActive: true },
    });

    if (quoteCount === 0) {
      const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      return { quote };
    }

    const randomIndex = Math.floor(Math.random() * quoteCount);
    const quote = await app.prisma.quote.findMany({
      where: { isActive: true },
      skip: randomIndex,
      take: 1,
    });

    if (!quote[0]) {
      const fallback = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      return { quote: fallback };
    }

    return { quote: quote[0] };
  });
}

