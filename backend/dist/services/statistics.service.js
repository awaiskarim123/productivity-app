"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkDurationInRange = getWorkDurationInRange;
exports.calculateFocusStreak = calculateFocusStreak;
exports.getTimeSummary = getTimeSummary;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
async function getWorkDurationInRange(prisma, userId, start, end) {
    const aggregate = await prisma.workSession.aggregate({
        where: {
            userId,
            startedAt: {
                gte: start,
                lt: end,
            },
            durationMinutes: {
                not: null,
            },
            deletedAt: null, // Only include non-deleted sessions
        },
        _sum: {
            durationMinutes: true,
        },
    });
    return aggregate._sum.durationMinutes ?? 0;
}
/**
 * Compute focus streak from per-day minutes (consecutive days meeting daily goal from today backward).
 */
function streakFromDailyMinutes(dailyMinutes, today, dailyGoalMinutes, rangeDays) {
    let streak = 0;
    for (let dayOffset = 0; dayOffset < rangeDays; dayOffset += 1) {
        const dayStart = today.subtract(dayOffset, "day");
        const key = dayStart.format("YYYY-MM-DD");
        const minutes = dailyMinutes.get(key) ?? 0;
        if (minutes >= dailyGoalMinutes) {
            streak += 1;
        }
        else {
            break;
        }
    }
    return streak;
}
async function calculateFocusStreak(prisma, userId, dailyGoalMinutes, rangeDays = 30) {
    const today = (0, dayjs_1.default)().startOf("day");
    const rangeStart = today.subtract(rangeDays, "day").toDate();
    const sessions = await prisma.workSession.findMany({
        where: {
            userId,
            startedAt: { gte: rangeStart },
            durationMinutes: { not: null },
            deletedAt: null,
        },
        select: { startedAt: true, durationMinutes: true },
    });
    const dailyMinutes = new Map();
    for (const s of sessions) {
        const d = (0, dayjs_1.default)(s.startedAt).startOf("day").format("YYYY-MM-DD");
        const current = dailyMinutes.get(d) ?? 0;
        dailyMinutes.set(d, current + (s.durationMinutes ?? 0));
    }
    return streakFromDailyMinutes(dailyMinutes, today, dailyGoalMinutes, rangeDays);
}
async function getTimeSummary(prisma, userId) {
    const now = (0, dayjs_1.default)();
    const todayStart = now.startOf("day");
    const weekStart = dayjs_1.default.utc().startOf("week");
    const monthStart = now.startOf("month");
    const [todayMinutes, weeklyMinutes, monthlyMinutes, totalAggregate] = await Promise.all([
        getWorkDurationInRange(prisma, userId, todayStart.toDate(), todayStart.add(1, "day").toDate()),
        getWorkDurationInRange(prisma, userId, weekStart.toDate(), weekStart.add(1, "week").toDate()),
        getWorkDurationInRange(prisma, userId, monthStart.toDate(), monthStart.add(1, "month").toDate()),
        prisma.workSession.aggregate({
            where: { userId, durationMinutes: { not: null }, deletedAt: null },
            _sum: { durationMinutes: true },
        }),
    ]);
    return {
        todayMinutes,
        weeklyMinutes,
        monthlyMinutes,
        totalMinutes: totalAggregate._sum.durationMinutes ?? 0,
    };
}
//# sourceMappingURL=statistics.service.js.map