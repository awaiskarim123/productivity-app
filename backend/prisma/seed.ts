import { PrismaClient } from "../src/generated/prisma/client";
import { motivationalQuotes } from "../src/data/quotes";

const prisma = new PrismaClient();

async function main() {
  for (const quote of motivationalQuotes) {
    await prisma.quote.upsert({
      where: { text: quote.text },
      update: {
        author: quote.author,
        isActive: true,
      },
      create: {
        text: quote.text,
        author: quote.author,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

