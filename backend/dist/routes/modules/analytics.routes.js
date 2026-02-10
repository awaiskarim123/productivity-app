"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = analyticsRoutes;
const dayjs_1 = __importDefault(require("dayjs"));
const enums_1 = require("../../generated/prisma/enums");
const statistics_service_1 = require("../../services/statistics.service");
const insights_service_1 = require("../../services/insights.service");
const advanced_analytics_service_1 = require("../../services/advanced-analytics.service");
const analytics_schema_1 = require("../../schemas/analytics.schema");
function buildBuckets(start, count, unit) {
    const buckets = new Map();
    for (let i = 0; i < count; i += 1) {
        const bucketStart = start.add(i, unit).startOf(unit).toISOString();
        buckets.set(bucketStart, 0);
    }
    return buckets;
}
function getSuggestedActions({ focusCompletionRate, averageFocusMinutes, dailyGoalMinutes, streak, }) {
    const suggestions = [];
    if (focusCompletionRate < 0.6) {
        suggestions.push("Try shorter focus intervals to build consistency.");
    }
    else if (focusCompletionRate > 0.9) {
        suggestions.push("Great streak! Consider increasing your daily goal slightly.");
    }
    if (averageFocusMinutes < dailyGoalMinutes * 0.5) {
        suggestions.push("Schedule a dedicated focus block early in your day.");
    }
    if (streak < 3) {
        suggestions.push("Log your next session to start building a focus streak.");
    }
    else {
        suggestions.push("Maintain your momentum by planning tomorrow's focus sessions.");
    }
    return suggestions;
}
async function analyticsRoutes(app) {
    app.addHook("preHandler", app.authenticate);
    app.get("/overview", async (request, reply) => {
        const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const [summary, workSessions, focusSessions] = await Promise.all([
            (0, statistics_service_1.getTimeSummary)(app.prisma, user.id),
            app.prisma.workSession.findMany({
                where: {
                    userId: user.id,
                    durationMinutes: { not: null },
                    startedAt: {
                        gte: (0, dayjs_1.default)().startOf("day").subtract(6, "day").toDate(),
                    },
                    deletedAt: null,
                },
                select: {
                    startedAt: true,
                    durationMinutes: true,
                },
            }),
            app.prisma.focusSession.findMany({
                where: {
                    userId: user.id,
                    durationMinutes: { not: null },
                    startedAt: {
                        gte: (0, dayjs_1.default)().startOf("day").subtract(29, "day").toDate(),
                    },
                    deletedAt: null,
                },
                select: {
                    startedAt: true,
                    durationMinutes: true,
                    completed: true,
                    distractions: true,
                    mode: true,
                },
            }),
        ]);
        const trendBuckets = buildBuckets((0, dayjs_1.default)().startOf("day").subtract(6, "day"), 7, "day");
        workSessions.forEach((session) => {
            const bucketKey = (0, dayjs_1.default)(session.startedAt).startOf("day").toISOString();
            const current = trendBuckets.get(bucketKey) ?? 0;
            trendBuckets.set(bucketKey, current + (session.durationMinutes ?? 0));
        });
        const focusStats = focusSessions.reduce((acc, session) => {
            if (session.mode === enums_1.FocusSessionMode.FOCUS) {
                acc.focusMinutes += session.durationMinutes ?? 0;
                acc.focusSessions += 1;
                if (session.completed) {
                    acc.completedSessions += 1;
                }
            }
            else {
                acc.breakMinutes += session.durationMinutes ?? 0;
            }
            acc.distractions += session.distractions ?? 0;
            return acc;
        }, {
            focusMinutes: 0,
            breakMinutes: 0,
            focusSessions: 0,
            completedSessions: 0,
            distractions: 0,
        });
        const focusCompletionRate = focusStats.focusSessions === 0 ? 0 : focusStats.completedSessions / focusStats.focusSessions;
        const averageFocusMinutes = focusStats.focusSessions === 0 ? 0 : focusStats.focusMinutes / focusStats.focusSessions;
        const suggestions = getSuggestedActions({
            focusCompletionRate,
            averageFocusMinutes,
            dailyGoalMinutes: user.dailyGoalMinutes,
            streak: user.focusStreak,
        });
        return {
            summary,
            focus: {
                totalMinutes: focusStats.focusMinutes,
                breakMinutes: focusStats.breakMinutes,
                completionRate: focusCompletionRate,
                averageFocusMinutes,
                totalSessions: focusStats.focusSessions,
                completedSessions: focusStats.completedSessions,
                distractions: focusStats.distractions,
            },
            streak: user.focusStreak,
            productivityTrend: Array.from(trendBuckets.entries()).map(([date, minutes]) => ({
                date,
                minutes,
            })),
            suggestions,
        };
    });
    app.get("/weekly-insights", async (request, reply) => {
        const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const query = request.query;
        const weekStart = query?.weekStart
            ? (0, dayjs_1.default)(query.weekStart).startOf("week").toDate()
            : (0, dayjs_1.default)().startOf("week").toDate();
        const insights = await (0, insights_service_1.getOrGenerateWeeklyInsights)(app.prisma, user.id, weekStart);
        return {
            weekStart: weekStart.toISOString(),
            weekEnd: (0, dayjs_1.default)(weekStart).endOf("week").toISOString(),
            ...insights,
        };
    });
    app.get("/recommendations", async (request, reply) => {
        const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const weekStart = (0, dayjs_1.default)().startOf("week").toDate();
        const insights = await (0, insights_service_1.getOrGenerateWeeklyInsights)(app.prisma, user.id, weekStart);
        return {
            recommendations: insights.recommendations,
            habitCorrelations: insights.habitCorrelations || [],
        };
    });
    app.get("/heatmap", async (request, reply) => {
        const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const parsed = analytics_schema_1.heatmapQuerySchema.safeParse(request.query ?? {});
        const days = parsed.success ? parsed.data.days : 14;
        const heatmap = await (0, advanced_analytics_service_1.getFocusHeatmapData)(app.prisma, user.id, days);
        return heatmap;
    });
    app.get("/burnout", async (request, reply) => {
        const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const parsed = analytics_schema_1.burnoutQuerySchema.safeParse(request.query ?? {});
        const windowDays = parsed.success ? parsed.data.windowDays : 7;
        const burnout = await (0, advanced_analytics_service_1.getBurnoutSignalData)(app.prisma, user.id, windowDays);
        return burnout;
    });
    app.get("/productivity-score", async (request, reply) => {
        const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const parsed = analytics_schema_1.productivityScoreQuerySchema.safeParse(request.query ?? {});
        const periodDays = parsed.success ? parsed.data.periodDays : 7;
        const score = await (0, advanced_analytics_service_1.getProductivityScoreData)(app.prisma, user.id, periodDays);
        return score;
    });
    app.get("/compare-periods", async (request, reply) => {
        const user = await app.prisma.user.findUnique({ where: { id: request.user.id } });
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const comparison = await (0, advanced_analytics_service_1.getPeriodComparisonData)(app.prisma, user.id);
        return comparison;
    });
}
//# sourceMappingURL=analytics.routes.js.map