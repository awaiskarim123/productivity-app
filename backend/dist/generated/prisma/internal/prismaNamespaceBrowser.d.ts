import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const ModelName: {
    readonly User: "User";
    readonly AuditLog: "AuditLog";
    readonly WorkSession: "WorkSession";
    readonly FocusSession: "FocusSession";
    readonly RefreshToken: "RefreshToken";
    readonly Quote: "Quote";
    readonly Task: "Task";
    readonly Habit: "Habit";
    readonly HabitLog: "HabitLog";
    readonly Note: "Note";
    readonly WeeklyInsight: "WeeklyInsight";
    readonly Goal: "Goal";
    readonly KeyResult: "KeyResult";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly name: "name";
    readonly dailyGoalMinutes: "dailyGoalMinutes";
    readonly focusStreak: "focusStreak";
    readonly lastLoginAt: "lastLoginAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const AuditLogScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly resource: "resource";
    readonly resourceId: "resourceId";
    readonly action: "action";
    readonly details: "details";
    readonly ipAddress: "ipAddress";
    readonly userAgent: "userAgent";
    readonly createdAt: "createdAt";
};
export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum];
export declare const WorkSessionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly startedAt: "startedAt";
    readonly endedAt: "endedAt";
    readonly durationMinutes: "durationMinutes";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
    readonly deletedAt: "deletedAt";
};
export type WorkSessionScalarFieldEnum = (typeof WorkSessionScalarFieldEnum)[keyof typeof WorkSessionScalarFieldEnum];
export declare const FocusSessionScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly mode: "mode";
    readonly startedAt: "startedAt";
    readonly endedAt: "endedAt";
    readonly targetMinutes: "targetMinutes";
    readonly durationMinutes: "durationMinutes";
    readonly completed: "completed";
    readonly distractions: "distractions";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
    readonly deletedAt: "deletedAt";
    readonly goalId: "goalId";
};
export type FocusSessionScalarFieldEnum = (typeof FocusSessionScalarFieldEnum)[keyof typeof FocusSessionScalarFieldEnum];
export declare const RefreshTokenScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly tokenHash: "tokenHash";
    readonly expiresAt: "expiresAt";
    readonly revokedAt: "revokedAt";
    readonly userAgent: "userAgent";
    readonly ipAddress: "ipAddress";
    readonly createdAt: "createdAt";
};
export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum];
export declare const QuoteScalarFieldEnum: {
    readonly id: "id";
    readonly text: "text";
    readonly author: "author";
    readonly category: "category";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
};
export type QuoteScalarFieldEnum = (typeof QuoteScalarFieldEnum)[keyof typeof QuoteScalarFieldEnum];
export declare const TaskScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly title: "title";
    readonly description: "description";
    readonly completed: "completed";
    readonly priority: "priority";
    readonly dueDate: "dueDate";
    readonly category: "category";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly completedAt: "completedAt";
    readonly deletedAt: "deletedAt";
    readonly goalId: "goalId";
};
export type TaskScalarFieldEnum = (typeof TaskScalarFieldEnum)[keyof typeof TaskScalarFieldEnum];
export declare const HabitScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly name: "name";
    readonly description: "description";
    readonly color: "color";
    readonly icon: "icon";
    readonly targetDays: "targetDays";
    readonly streak: "streak";
    readonly bestStreak: "bestStreak";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly deletedAt: "deletedAt";
    readonly goalId: "goalId";
};
export type HabitScalarFieldEnum = (typeof HabitScalarFieldEnum)[keyof typeof HabitScalarFieldEnum];
export declare const HabitLogScalarFieldEnum: {
    readonly id: "id";
    readonly habitId: "habitId";
    readonly date: "date";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
};
export type HabitLogScalarFieldEnum = (typeof HabitLogScalarFieldEnum)[keyof typeof HabitLogScalarFieldEnum];
export declare const NoteScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly title: "title";
    readonly content: "content";
    readonly tags: "tags";
    readonly isPinned: "isPinned";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly deletedAt: "deletedAt";
};
export type NoteScalarFieldEnum = (typeof NoteScalarFieldEnum)[keyof typeof NoteScalarFieldEnum];
export declare const WeeklyInsightScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly weekStart: "weekStart";
    readonly weekEnd: "weekEnd";
    readonly peakHours: "peakHours";
    readonly lowProductivityDays: "lowProductivityDays";
    readonly weekOverWeekTrend: "weekOverWeekTrend";
    readonly averageDailyMinutes: "averageDailyMinutes";
    readonly totalSessions: "totalSessions";
    readonly completedFocusSessions: "completedFocusSessions";
    readonly habitCorrelations: "habitCorrelations";
    readonly insights: "insights";
    readonly recommendations: "recommendations";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WeeklyInsightScalarFieldEnum = (typeof WeeklyInsightScalarFieldEnum)[keyof typeof WeeklyInsightScalarFieldEnum];
export declare const GoalScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly title: "title";
    readonly description: "description";
    readonly type: "type";
    readonly startDate: "startDate";
    readonly endDate: "endDate";
    readonly targetValue: "targetValue";
    readonly currentValue: "currentValue";
    readonly progressPercent: "progressPercent";
    readonly healthStatus: "healthStatus";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly deletedAt: "deletedAt";
};
export type GoalScalarFieldEnum = (typeof GoalScalarFieldEnum)[keyof typeof GoalScalarFieldEnum];
export declare const KeyResultScalarFieldEnum: {
    readonly id: "id";
    readonly goalId: "goalId";
    readonly title: "title";
    readonly description: "description";
    readonly targetValue: "targetValue";
    readonly currentValue: "currentValue";
    readonly progressPercent: "progressPercent";
    readonly weight: "weight";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type KeyResultScalarFieldEnum = (typeof KeyResultScalarFieldEnum)[keyof typeof KeyResultScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
    readonly JsonNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const JsonNullValueInput: {
    readonly JsonNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
    readonly JsonNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
    readonly AnyNull: {
        "__#private@#private": any;
        _getNamespace(): string;
        _getName(): string;
        toString(): string;
    };
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
//# sourceMappingURL=prismaNamespaceBrowser.d.ts.map