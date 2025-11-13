"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = motivationRoutes;
const quotes_1 = require("../../data/quotes");
async function motivationRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    app.get("/quote", async () => {
        const quoteCount = await app.prisma.quote.count({
            where: { isActive: true },
        });
        if (quoteCount === 0) {
            const quote = quotes_1.motivationalQuotes[Math.floor(Math.random() * quotes_1.motivationalQuotes.length)];
            return { quote };
        }
        const randomIndex = Math.floor(Math.random() * quoteCount);
        const quote = await app.prisma.quote.findMany({
            where: { isActive: true },
            skip: randomIndex,
            take: 1,
        });
        if (!quote[0]) {
            const fallback = quotes_1.motivationalQuotes[Math.floor(Math.random() * quotes_1.motivationalQuotes.length)];
            return { quote: fallback };
        }
        return { quote: quote[0] };
    });
}
//# sourceMappingURL=motivation.routes.js.map