"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalProgressPercent = goalProgressPercent;
exports.getDailySummary = getDailySummary;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
/** Pure: focus progress toward daily goal as 0–100. */
function goalProgressPercent(focusMinutes, dailyGoalMinutes) {
    if (dailyGoalMinutes <= 0)
        return 0;
    return Math.min(100, Math.round((focusMinutes / dailyGoalMinutes) * 100));
}
async function getDailySummary(prisma, userId) {
    const now = dayjs_1.default.utc();
    const todayStart = now.startOf("day").toDate();
    const todayEnd = now.endOf("day").toDate();
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { dailyGoalMinutes: true, focusStreak: true },
    });
    if (!user) {
        return {
            tasksCompletedToday: 0,
            focusMinutesToday: 0,
            habitsLoggedToday: 0,
            dailyGoalMinutes: 300,
            focusStreak: 0,
            goalProgressPercent: 0,
        };
    }
    const [tasksCompletedToday, focusResult, habitsLoggedToday] = await Promise.all([
        prisma.task.count({
            where: {
                userId,
                completed: true,
                completedAt: { gte: todayStart, lte: todayEnd },
                deletedAt: null,
            },
        }),
        prisma.focusSession.aggregate({
            where: {
                userId,
                mode: "FOCUS",
                startedAt: { gte: todayStart, lte: todayEnd },
                deletedAt: null,
            },
            _sum: { durationMinutes: true },
        }),
        prisma.habitLog.count({
            where: {
                habit: { userId },
                date: { gte: todayStart, lte: todayEnd },
            },
        }),
    ]);
    const focusMinutesToday = focusResult._sum.durationMinutes ?? 0;
    const progress = goalProgressPercent(focusMinutesToday, user.dailyGoalMinutes);
    return {
        tasksCompletedToday,
        focusMinutesToday,
        habitsLoggedToday,
        dailyGoalMinutes: user.dailyGoalMinutes,
        focusStreak: user.focusStreak,
        goalProgressPercent: progress,
    };
}
//# sourceMappingURL=daily-summary.service.js.map