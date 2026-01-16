"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkDurationInRange = getWorkDurationInRange;
exports.calculateFocusStreak = calculateFocusStreak;
exports.getTimeSummary = getTimeSummary;
const dayjs_1 = __importDefault(require("dayjs"));
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
async function calculateFocusStreak(prisma, userId, dailyGoalMinutes, rangeDays = 30) {
    let streak = 0;
    const today = (0, dayjs_1.default)().startOf("day");
    for (let dayOffset = 0; dayOffset < rangeDays; dayOffset += 1) {
        const dayStart = today.subtract(dayOffset, "day");
        const dayEnd = dayStart.endOf("day");
        const minutes = await getWorkDurationInRange(prisma, userId, dayStart.toDate(), dayEnd.add(1, "millisecond").toDate());
        if (minutes >= dailyGoalMinutes) {
            streak += 1;
        }
        else {
            break;
        }
    }
    return streak;
}
async function getTimeSummary(prisma, userId) {
    const now = (0, dayjs_1.default)();
    const todayStart = now.startOf("day");
    const weekStart = now.startOf("week");
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