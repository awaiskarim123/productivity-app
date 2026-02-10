import * as runtime from "@prisma/client/runtime/library";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
export * from "./enums";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model AuditLog
 *
 */
export type AuditLog = Prisma.AuditLogModel;
/**
 * Model WorkSession
 *
 */
export type WorkSession = Prisma.WorkSessionModel;
/**
 * Model FocusSession
 *
 */
export type FocusSession = Prisma.FocusSessionModel;
/**
 * Model RefreshToken
 *
 */
export type RefreshToken = Prisma.RefreshTokenModel;
/**
 * Model Quote
 *
 */
export type Quote = Prisma.QuoteModel;
/**
 * Model Task
 *
 */
export type Task = Prisma.TaskModel;
/**
 * Model Habit
 *
 */
export type Habit = Prisma.HabitModel;
/**
 * Model HabitLog
 *
 */
export type HabitLog = Prisma.HabitLogModel;
/**
 * Model Note
 *
 */
export type Note = Prisma.NoteModel;
/**
 * Model WeeklyInsight
 *
 */
export type WeeklyInsight = Prisma.WeeklyInsightModel;
/**
 * Model Goal
 *
 */
export type Goal = Prisma.GoalModel;
/**
 * Model KeyResult
 *
 */
export type KeyResult = Prisma.KeyResultModel;
//# sourceMappingURL=client.d.ts.map