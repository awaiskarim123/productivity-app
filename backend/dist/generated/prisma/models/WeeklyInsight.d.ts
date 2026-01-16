import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model WeeklyInsight
 *
 */
export type WeeklyInsightModel = runtime.Types.Result.DefaultSelection<Prisma.$WeeklyInsightPayload>;
export type AggregateWeeklyInsight = {
    _count: WeeklyInsightCountAggregateOutputType | null;
    _avg: WeeklyInsightAvgAggregateOutputType | null;
    _sum: WeeklyInsightSumAggregateOutputType | null;
    _min: WeeklyInsightMinAggregateOutputType | null;
    _max: WeeklyInsightMaxAggregateOutputType | null;
};
export type WeeklyInsightAvgAggregateOutputType = {
    peakHours: number | null;
    averageDailyMinutes: number | null;
    totalSessions: number | null;
    completedFocusSessions: number | null;
};
export type WeeklyInsightSumAggregateOutputType = {
    peakHours: number[];
    averageDailyMinutes: number | null;
    totalSessions: number | null;
    completedFocusSessions: number | null;
};
export type WeeklyInsightMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    weekStart: Date | null;
    weekEnd: Date | null;
    weekOverWeekTrend: string | null;
    averageDailyMinutes: number | null;
    totalSessions: number | null;
    completedFocusSessions: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WeeklyInsightMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    weekStart: Date | null;
    weekEnd: Date | null;
    weekOverWeekTrend: string | null;
    averageDailyMinutes: number | null;
    totalSessions: number | null;
    completedFocusSessions: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WeeklyInsightCountAggregateOutputType = {
    id: number;
    userId: number;
    weekStart: number;
    weekEnd: number;
    peakHours: number;
    lowProductivityDays: number;
    weekOverWeekTrend: number;
    averageDailyMinutes: number;
    totalSessions: number;
    completedFocusSessions: number;
    habitCorrelations: number;
    insights: number;
    recommendations: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type WeeklyInsightAvgAggregateInputType = {
    peakHours?: true;
    averageDailyMinutes?: true;
    totalSessions?: true;
    completedFocusSessions?: true;
};
export type WeeklyInsightSumAggregateInputType = {
    peakHours?: true;
    averageDailyMinutes?: true;
    totalSessions?: true;
    completedFocusSessions?: true;
};
export type WeeklyInsightMinAggregateInputType = {
    id?: true;
    userId?: true;
    weekStart?: true;
    weekEnd?: true;
    weekOverWeekTrend?: true;
    averageDailyMinutes?: true;
    totalSessions?: true;
    completedFocusSessions?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WeeklyInsightMaxAggregateInputType = {
    id?: true;
    userId?: true;
    weekStart?: true;
    weekEnd?: true;
    weekOverWeekTrend?: true;
    averageDailyMinutes?: true;
    totalSessions?: true;
    completedFocusSessions?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WeeklyInsightCountAggregateInputType = {
    id?: true;
    userId?: true;
    weekStart?: true;
    weekEnd?: true;
    peakHours?: true;
    lowProductivityDays?: true;
    weekOverWeekTrend?: true;
    averageDailyMinutes?: true;
    totalSessions?: true;
    completedFocusSessions?: true;
    habitCorrelations?: true;
    insights?: true;
    recommendations?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type WeeklyInsightAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which WeeklyInsight to aggregate.
     */
    where?: Prisma.WeeklyInsightWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WeeklyInsights to fetch.
     */
    orderBy?: Prisma.WeeklyInsightOrderByWithRelationInput | Prisma.WeeklyInsightOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.WeeklyInsightWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WeeklyInsights from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WeeklyInsights.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned WeeklyInsights
    **/
    _count?: true | WeeklyInsightCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: WeeklyInsightAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: WeeklyInsightSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: WeeklyInsightMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: WeeklyInsightMaxAggregateInputType;
};
export type GetWeeklyInsightAggregateType<T extends WeeklyInsightAggregateArgs> = {
    [P in keyof T & keyof AggregateWeeklyInsight]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateWeeklyInsight[P]> : Prisma.GetScalarType<T[P], AggregateWeeklyInsight[P]>;
};
export type WeeklyInsightGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WeeklyInsightWhereInput;
    orderBy?: Prisma.WeeklyInsightOrderByWithAggregationInput | Prisma.WeeklyInsightOrderByWithAggregationInput[];
    by: Prisma.WeeklyInsightScalarFieldEnum[] | Prisma.WeeklyInsightScalarFieldEnum;
    having?: Prisma.WeeklyInsightScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WeeklyInsightCountAggregateInputType | true;
    _avg?: WeeklyInsightAvgAggregateInputType;
    _sum?: WeeklyInsightSumAggregateInputType;
    _min?: WeeklyInsightMinAggregateInputType;
    _max?: WeeklyInsightMaxAggregateInputType;
};
export type WeeklyInsightGroupByOutputType = {
    id: string;
    userId: string;
    weekStart: Date;
    weekEnd: Date;
    peakHours: number[];
    lowProductivityDays: string[];
    weekOverWeekTrend: string;
    averageDailyMinutes: number;
    totalSessions: number;
    completedFocusSessions: number;
    habitCorrelations: runtime.JsonValue | null;
    insights: runtime.JsonValue;
    recommendations: runtime.JsonValue;
    createdAt: Date;
    updatedAt: Date;
    _count: WeeklyInsightCountAggregateOutputType | null;
    _avg: WeeklyInsightAvgAggregateOutputType | null;
    _sum: WeeklyInsightSumAggregateOutputType | null;
    _min: WeeklyInsightMinAggregateOutputType | null;
    _max: WeeklyInsightMaxAggregateOutputType | null;
};
type GetWeeklyInsightGroupByPayload<T extends WeeklyInsightGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<WeeklyInsightGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof WeeklyInsightGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], WeeklyInsightGroupByOutputType[P]> : Prisma.GetScalarType<T[P], WeeklyInsightGroupByOutputType[P]>;
}>>;
export type WeeklyInsightWhereInput = {
    AND?: Prisma.WeeklyInsightWhereInput | Prisma.WeeklyInsightWhereInput[];
    OR?: Prisma.WeeklyInsightWhereInput[];
    NOT?: Prisma.WeeklyInsightWhereInput | Prisma.WeeklyInsightWhereInput[];
    id?: Prisma.StringFilter<"WeeklyInsight"> | string;
    userId?: Prisma.StringFilter<"WeeklyInsight"> | string;
    weekStart?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    weekEnd?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    peakHours?: Prisma.IntNullableListFilter<"WeeklyInsight">;
    lowProductivityDays?: Prisma.StringNullableListFilter<"WeeklyInsight">;
    weekOverWeekTrend?: Prisma.StringFilter<"WeeklyInsight"> | string;
    averageDailyMinutes?: Prisma.IntFilter<"WeeklyInsight"> | number;
    totalSessions?: Prisma.IntFilter<"WeeklyInsight"> | number;
    completedFocusSessions?: Prisma.IntFilter<"WeeklyInsight"> | number;
    habitCorrelations?: Prisma.JsonNullableFilter<"WeeklyInsight">;
    insights?: Prisma.JsonFilter<"WeeklyInsight">;
    recommendations?: Prisma.JsonFilter<"WeeklyInsight">;
    createdAt?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type WeeklyInsightOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    weekStart?: Prisma.SortOrder;
    weekEnd?: Prisma.SortOrder;
    peakHours?: Prisma.SortOrder;
    lowProductivityDays?: Prisma.SortOrder;
    weekOverWeekTrend?: Prisma.SortOrder;
    averageDailyMinutes?: Prisma.SortOrder;
    totalSessions?: Prisma.SortOrder;
    completedFocusSessions?: Prisma.SortOrder;
    habitCorrelations?: Prisma.SortOrderInput | Prisma.SortOrder;
    insights?: Prisma.SortOrder;
    recommendations?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type WeeklyInsightWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId_weekStart?: Prisma.WeeklyInsightUserIdWeekStartCompoundUniqueInput;
    AND?: Prisma.WeeklyInsightWhereInput | Prisma.WeeklyInsightWhereInput[];
    OR?: Prisma.WeeklyInsightWhereInput[];
    NOT?: Prisma.WeeklyInsightWhereInput | Prisma.WeeklyInsightWhereInput[];
    userId?: Prisma.StringFilter<"WeeklyInsight"> | string;
    weekStart?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    weekEnd?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    peakHours?: Prisma.IntNullableListFilter<"WeeklyInsight">;
    lowProductivityDays?: Prisma.StringNullableListFilter<"WeeklyInsight">;
    weekOverWeekTrend?: Prisma.StringFilter<"WeeklyInsight"> | string;
    averageDailyMinutes?: Prisma.IntFilter<"WeeklyInsight"> | number;
    totalSessions?: Prisma.IntFilter<"WeeklyInsight"> | number;
    completedFocusSessions?: Prisma.IntFilter<"WeeklyInsight"> | number;
    habitCorrelations?: Prisma.JsonNullableFilter<"WeeklyInsight">;
    insights?: Prisma.JsonFilter<"WeeklyInsight">;
    recommendations?: Prisma.JsonFilter<"WeeklyInsight">;
    createdAt?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "userId_weekStart">;
export type WeeklyInsightOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    weekStart?: Prisma.SortOrder;
    weekEnd?: Prisma.SortOrder;
    peakHours?: Prisma.SortOrder;
    lowProductivityDays?: Prisma.SortOrder;
    weekOverWeekTrend?: Prisma.SortOrder;
    averageDailyMinutes?: Prisma.SortOrder;
    totalSessions?: Prisma.SortOrder;
    completedFocusSessions?: Prisma.SortOrder;
    habitCorrelations?: Prisma.SortOrderInput | Prisma.SortOrder;
    insights?: Prisma.SortOrder;
    recommendations?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.WeeklyInsightCountOrderByAggregateInput;
    _avg?: Prisma.WeeklyInsightAvgOrderByAggregateInput;
    _max?: Prisma.WeeklyInsightMaxOrderByAggregateInput;
    _min?: Prisma.WeeklyInsightMinOrderByAggregateInput;
    _sum?: Prisma.WeeklyInsightSumOrderByAggregateInput;
};
export type WeeklyInsightScalarWhereWithAggregatesInput = {
    AND?: Prisma.WeeklyInsightScalarWhereWithAggregatesInput | Prisma.WeeklyInsightScalarWhereWithAggregatesInput[];
    OR?: Prisma.WeeklyInsightScalarWhereWithAggregatesInput[];
    NOT?: Prisma.WeeklyInsightScalarWhereWithAggregatesInput | Prisma.WeeklyInsightScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"WeeklyInsight"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"WeeklyInsight"> | string;
    weekStart?: Prisma.DateTimeWithAggregatesFilter<"WeeklyInsight"> | Date | string;
    weekEnd?: Prisma.DateTimeWithAggregatesFilter<"WeeklyInsight"> | Date | string;
    peakHours?: Prisma.IntNullableListFilter<"WeeklyInsight">;
    lowProductivityDays?: Prisma.StringNullableListFilter<"WeeklyInsight">;
    weekOverWeekTrend?: Prisma.StringWithAggregatesFilter<"WeeklyInsight"> | string;
    averageDailyMinutes?: Prisma.IntWithAggregatesFilter<"WeeklyInsight"> | number;
    totalSessions?: Prisma.IntWithAggregatesFilter<"WeeklyInsight"> | number;
    completedFocusSessions?: Prisma.IntWithAggregatesFilter<"WeeklyInsight"> | number;
    habitCorrelations?: Prisma.JsonNullableWithAggregatesFilter<"WeeklyInsight">;
    insights?: Prisma.JsonWithAggregatesFilter<"WeeklyInsight">;
    recommendations?: Prisma.JsonWithAggregatesFilter<"WeeklyInsight">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"WeeklyInsight"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"WeeklyInsight"> | Date | string;
};
export type WeeklyInsightCreateInput = {
    id?: string;
    weekStart: Date | string;
    weekEnd: Date | string;
    peakHours?: Prisma.WeeklyInsightCreatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightCreatelowProductivityDaysInput | string[];
    weekOverWeekTrend: string;
    averageDailyMinutes: number;
    totalSessions: number;
    completedFocusSessions: number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutWeeklyInsightsInput;
};
export type WeeklyInsightUncheckedCreateInput = {
    id?: string;
    userId: string;
    weekStart: Date | string;
    weekEnd: Date | string;
    peakHours?: Prisma.WeeklyInsightCreatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightCreatelowProductivityDaysInput | string[];
    weekOverWeekTrend: string;
    averageDailyMinutes: number;
    totalSessions: number;
    completedFocusSessions: number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WeeklyInsightUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    weekStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    weekEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    peakHours?: Prisma.WeeklyInsightUpdatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightUpdatelowProductivityDaysInput | string[];
    weekOverWeekTrend?: Prisma.StringFieldUpdateOperationsInput | string;
    averageDailyMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    completedFocusSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutWeeklyInsightsNestedInput;
};
export type WeeklyInsightUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    weekStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    weekEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    peakHours?: Prisma.WeeklyInsightUpdatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightUpdatelowProductivityDaysInput | string[];
    weekOverWeekTrend?: Prisma.StringFieldUpdateOperationsInput | string;
    averageDailyMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    completedFocusSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WeeklyInsightCreateManyInput = {
    id?: string;
    userId: string;
    weekStart: Date | string;
    weekEnd: Date | string;
    peakHours?: Prisma.WeeklyInsightCreatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightCreatelowProductivityDaysInput | string[];
    weekOverWeekTrend: string;
    averageDailyMinutes: number;
    totalSessions: number;
    completedFocusSessions: number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WeeklyInsightUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    weekStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    weekEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    peakHours?: Prisma.WeeklyInsightUpdatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightUpdatelowProductivityDaysInput | string[];
    weekOverWeekTrend?: Prisma.StringFieldUpdateOperationsInput | string;
    averageDailyMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    completedFocusSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WeeklyInsightUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    weekStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    weekEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    peakHours?: Prisma.WeeklyInsightUpdatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightUpdatelowProductivityDaysInput | string[];
    weekOverWeekTrend?: Prisma.StringFieldUpdateOperationsInput | string;
    averageDailyMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    completedFocusSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WeeklyInsightListRelationFilter = {
    every?: Prisma.WeeklyInsightWhereInput;
    some?: Prisma.WeeklyInsightWhereInput;
    none?: Prisma.WeeklyInsightWhereInput;
};
export type WeeklyInsightOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type IntNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null;
    has?: number | Prisma.IntFieldRefInput<$PrismaModel> | null;
    hasEvery?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    hasSome?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type WeeklyInsightUserIdWeekStartCompoundUniqueInput = {
    userId: string;
    weekStart: Date | string;
};
export type WeeklyInsightCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    weekStart?: Prisma.SortOrder;
    weekEnd?: Prisma.SortOrder;
    peakHours?: Prisma.SortOrder;
    lowProductivityDays?: Prisma.SortOrder;
    weekOverWeekTrend?: Prisma.SortOrder;
    averageDailyMinutes?: Prisma.SortOrder;
    totalSessions?: Prisma.SortOrder;
    completedFocusSessions?: Prisma.SortOrder;
    habitCorrelations?: Prisma.SortOrder;
    insights?: Prisma.SortOrder;
    recommendations?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WeeklyInsightAvgOrderByAggregateInput = {
    peakHours?: Prisma.SortOrder;
    averageDailyMinutes?: Prisma.SortOrder;
    totalSessions?: Prisma.SortOrder;
    completedFocusSessions?: Prisma.SortOrder;
};
export type WeeklyInsightMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    weekStart?: Prisma.SortOrder;
    weekEnd?: Prisma.SortOrder;
    weekOverWeekTrend?: Prisma.SortOrder;
    averageDailyMinutes?: Prisma.SortOrder;
    totalSessions?: Prisma.SortOrder;
    completedFocusSessions?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WeeklyInsightMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    weekStart?: Prisma.SortOrder;
    weekEnd?: Prisma.SortOrder;
    weekOverWeekTrend?: Prisma.SortOrder;
    averageDailyMinutes?: Prisma.SortOrder;
    totalSessions?: Prisma.SortOrder;
    completedFocusSessions?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WeeklyInsightSumOrderByAggregateInput = {
    peakHours?: Prisma.SortOrder;
    averageDailyMinutes?: Prisma.SortOrder;
    totalSessions?: Prisma.SortOrder;
    completedFocusSessions?: Prisma.SortOrder;
};
export type WeeklyInsightCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.WeeklyInsightCreateWithoutUserInput, Prisma.WeeklyInsightUncheckedCreateWithoutUserInput> | Prisma.WeeklyInsightCreateWithoutUserInput[] | Prisma.WeeklyInsightUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.WeeklyInsightCreateOrConnectWithoutUserInput | Prisma.WeeklyInsightCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.WeeklyInsightCreateManyUserInputEnvelope;
    connect?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
};
export type WeeklyInsightUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.WeeklyInsightCreateWithoutUserInput, Prisma.WeeklyInsightUncheckedCreateWithoutUserInput> | Prisma.WeeklyInsightCreateWithoutUserInput[] | Prisma.WeeklyInsightUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.WeeklyInsightCreateOrConnectWithoutUserInput | Prisma.WeeklyInsightCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.WeeklyInsightCreateManyUserInputEnvelope;
    connect?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
};
export type WeeklyInsightUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.WeeklyInsightCreateWithoutUserInput, Prisma.WeeklyInsightUncheckedCreateWithoutUserInput> | Prisma.WeeklyInsightCreateWithoutUserInput[] | Prisma.WeeklyInsightUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.WeeklyInsightCreateOrConnectWithoutUserInput | Prisma.WeeklyInsightCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.WeeklyInsightUpsertWithWhereUniqueWithoutUserInput | Prisma.WeeklyInsightUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.WeeklyInsightCreateManyUserInputEnvelope;
    set?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
    disconnect?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
    delete?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
    connect?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
    update?: Prisma.WeeklyInsightUpdateWithWhereUniqueWithoutUserInput | Prisma.WeeklyInsightUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.WeeklyInsightUpdateManyWithWhereWithoutUserInput | Prisma.WeeklyInsightUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.WeeklyInsightScalarWhereInput | Prisma.WeeklyInsightScalarWhereInput[];
};
export type WeeklyInsightUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.WeeklyInsightCreateWithoutUserInput, Prisma.WeeklyInsightUncheckedCreateWithoutUserInput> | Prisma.WeeklyInsightCreateWithoutUserInput[] | Prisma.WeeklyInsightUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.WeeklyInsightCreateOrConnectWithoutUserInput | Prisma.WeeklyInsightCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.WeeklyInsightUpsertWithWhereUniqueWithoutUserInput | Prisma.WeeklyInsightUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.WeeklyInsightCreateManyUserInputEnvelope;
    set?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
    disconnect?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
    delete?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
    connect?: Prisma.WeeklyInsightWhereUniqueInput | Prisma.WeeklyInsightWhereUniqueInput[];
    update?: Prisma.WeeklyInsightUpdateWithWhereUniqueWithoutUserInput | Prisma.WeeklyInsightUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.WeeklyInsightUpdateManyWithWhereWithoutUserInput | Prisma.WeeklyInsightUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.WeeklyInsightScalarWhereInput | Prisma.WeeklyInsightScalarWhereInput[];
};
export type WeeklyInsightCreatepeakHoursInput = {
    set: number[];
};
export type WeeklyInsightCreatelowProductivityDaysInput = {
    set: string[];
};
export type WeeklyInsightUpdatepeakHoursInput = {
    set?: number[];
    push?: number | number[];
};
export type WeeklyInsightUpdatelowProductivityDaysInput = {
    set?: string[];
    push?: string | string[];
};
export type WeeklyInsightCreateWithoutUserInput = {
    id?: string;
    weekStart: Date | string;
    weekEnd: Date | string;
    peakHours?: Prisma.WeeklyInsightCreatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightCreatelowProductivityDaysInput | string[];
    weekOverWeekTrend: string;
    averageDailyMinutes: number;
    totalSessions: number;
    completedFocusSessions: number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WeeklyInsightUncheckedCreateWithoutUserInput = {
    id?: string;
    weekStart: Date | string;
    weekEnd: Date | string;
    peakHours?: Prisma.WeeklyInsightCreatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightCreatelowProductivityDaysInput | string[];
    weekOverWeekTrend: string;
    averageDailyMinutes: number;
    totalSessions: number;
    completedFocusSessions: number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WeeklyInsightCreateOrConnectWithoutUserInput = {
    where: Prisma.WeeklyInsightWhereUniqueInput;
    create: Prisma.XOR<Prisma.WeeklyInsightCreateWithoutUserInput, Prisma.WeeklyInsightUncheckedCreateWithoutUserInput>;
};
export type WeeklyInsightCreateManyUserInputEnvelope = {
    data: Prisma.WeeklyInsightCreateManyUserInput | Prisma.WeeklyInsightCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type WeeklyInsightUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.WeeklyInsightWhereUniqueInput;
    update: Prisma.XOR<Prisma.WeeklyInsightUpdateWithoutUserInput, Prisma.WeeklyInsightUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.WeeklyInsightCreateWithoutUserInput, Prisma.WeeklyInsightUncheckedCreateWithoutUserInput>;
};
export type WeeklyInsightUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.WeeklyInsightWhereUniqueInput;
    data: Prisma.XOR<Prisma.WeeklyInsightUpdateWithoutUserInput, Prisma.WeeklyInsightUncheckedUpdateWithoutUserInput>;
};
export type WeeklyInsightUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.WeeklyInsightScalarWhereInput;
    data: Prisma.XOR<Prisma.WeeklyInsightUpdateManyMutationInput, Prisma.WeeklyInsightUncheckedUpdateManyWithoutUserInput>;
};
export type WeeklyInsightScalarWhereInput = {
    AND?: Prisma.WeeklyInsightScalarWhereInput | Prisma.WeeklyInsightScalarWhereInput[];
    OR?: Prisma.WeeklyInsightScalarWhereInput[];
    NOT?: Prisma.WeeklyInsightScalarWhereInput | Prisma.WeeklyInsightScalarWhereInput[];
    id?: Prisma.StringFilter<"WeeklyInsight"> | string;
    userId?: Prisma.StringFilter<"WeeklyInsight"> | string;
    weekStart?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    weekEnd?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    peakHours?: Prisma.IntNullableListFilter<"WeeklyInsight">;
    lowProductivityDays?: Prisma.StringNullableListFilter<"WeeklyInsight">;
    weekOverWeekTrend?: Prisma.StringFilter<"WeeklyInsight"> | string;
    averageDailyMinutes?: Prisma.IntFilter<"WeeklyInsight"> | number;
    totalSessions?: Prisma.IntFilter<"WeeklyInsight"> | number;
    completedFocusSessions?: Prisma.IntFilter<"WeeklyInsight"> | number;
    habitCorrelations?: Prisma.JsonNullableFilter<"WeeklyInsight">;
    insights?: Prisma.JsonFilter<"WeeklyInsight">;
    recommendations?: Prisma.JsonFilter<"WeeklyInsight">;
    createdAt?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"WeeklyInsight"> | Date | string;
};
export type WeeklyInsightCreateManyUserInput = {
    id?: string;
    weekStart: Date | string;
    weekEnd: Date | string;
    peakHours?: Prisma.WeeklyInsightCreatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightCreatelowProductivityDaysInput | string[];
    weekOverWeekTrend: string;
    averageDailyMinutes: number;
    totalSessions: number;
    completedFocusSessions: number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WeeklyInsightUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    weekStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    weekEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    peakHours?: Prisma.WeeklyInsightUpdatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightUpdatelowProductivityDaysInput | string[];
    weekOverWeekTrend?: Prisma.StringFieldUpdateOperationsInput | string;
    averageDailyMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    completedFocusSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WeeklyInsightUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    weekStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    weekEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    peakHours?: Prisma.WeeklyInsightUpdatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightUpdatelowProductivityDaysInput | string[];
    weekOverWeekTrend?: Prisma.StringFieldUpdateOperationsInput | string;
    averageDailyMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    completedFocusSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WeeklyInsightUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    weekStart?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    weekEnd?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    peakHours?: Prisma.WeeklyInsightUpdatepeakHoursInput | number[];
    lowProductivityDays?: Prisma.WeeklyInsightUpdatelowProductivityDaysInput | string[];
    weekOverWeekTrend?: Prisma.StringFieldUpdateOperationsInput | string;
    averageDailyMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    completedFocusSessions?: Prisma.IntFieldUpdateOperationsInput | number;
    habitCorrelations?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    insights?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    recommendations?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WeeklyInsightSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    weekStart?: boolean;
    weekEnd?: boolean;
    peakHours?: boolean;
    lowProductivityDays?: boolean;
    weekOverWeekTrend?: boolean;
    averageDailyMinutes?: boolean;
    totalSessions?: boolean;
    completedFocusSessions?: boolean;
    habitCorrelations?: boolean;
    insights?: boolean;
    recommendations?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["weeklyInsight"]>;
export type WeeklyInsightSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    weekStart?: boolean;
    weekEnd?: boolean;
    peakHours?: boolean;
    lowProductivityDays?: boolean;
    weekOverWeekTrend?: boolean;
    averageDailyMinutes?: boolean;
    totalSessions?: boolean;
    completedFocusSessions?: boolean;
    habitCorrelations?: boolean;
    insights?: boolean;
    recommendations?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["weeklyInsight"]>;
export type WeeklyInsightSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    weekStart?: boolean;
    weekEnd?: boolean;
    peakHours?: boolean;
    lowProductivityDays?: boolean;
    weekOverWeekTrend?: boolean;
    averageDailyMinutes?: boolean;
    totalSessions?: boolean;
    completedFocusSessions?: boolean;
    habitCorrelations?: boolean;
    insights?: boolean;
    recommendations?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["weeklyInsight"]>;
export type WeeklyInsightSelectScalar = {
    id?: boolean;
    userId?: boolean;
    weekStart?: boolean;
    weekEnd?: boolean;
    peakHours?: boolean;
    lowProductivityDays?: boolean;
    weekOverWeekTrend?: boolean;
    averageDailyMinutes?: boolean;
    totalSessions?: boolean;
    completedFocusSessions?: boolean;
    habitCorrelations?: boolean;
    insights?: boolean;
    recommendations?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type WeeklyInsightOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "weekStart" | "weekEnd" | "peakHours" | "lowProductivityDays" | "weekOverWeekTrend" | "averageDailyMinutes" | "totalSessions" | "completedFocusSessions" | "habitCorrelations" | "insights" | "recommendations" | "createdAt" | "updatedAt", ExtArgs["result"]["weeklyInsight"]>;
export type WeeklyInsightInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type WeeklyInsightIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type WeeklyInsightIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $WeeklyInsightPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "WeeklyInsight";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        weekStart: Date;
        weekEnd: Date;
        peakHours: number[];
        lowProductivityDays: string[];
        weekOverWeekTrend: string;
        averageDailyMinutes: number;
        totalSessions: number;
        completedFocusSessions: number;
        habitCorrelations: runtime.JsonValue | null;
        insights: runtime.JsonValue;
        recommendations: runtime.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["weeklyInsight"]>;
    composites: {};
};
export type WeeklyInsightGetPayload<S extends boolean | null | undefined | WeeklyInsightDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload, S>;
export type WeeklyInsightCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<WeeklyInsightFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: WeeklyInsightCountAggregateInputType | true;
};
export interface WeeklyInsightDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['WeeklyInsight'];
        meta: {
            name: 'WeeklyInsight';
        };
    };
    /**
     * Find zero or one WeeklyInsight that matches the filter.
     * @param {WeeklyInsightFindUniqueArgs} args - Arguments to find a WeeklyInsight
     * @example
     * // Get one WeeklyInsight
     * const weeklyInsight = await prisma.weeklyInsight.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeeklyInsightFindUniqueArgs>(args: Prisma.SelectSubset<T, WeeklyInsightFindUniqueArgs<ExtArgs>>): Prisma.Prisma__WeeklyInsightClient<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one WeeklyInsight that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeeklyInsightFindUniqueOrThrowArgs} args - Arguments to find a WeeklyInsight
     * @example
     * // Get one WeeklyInsight
     * const weeklyInsight = await prisma.weeklyInsight.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeeklyInsightFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, WeeklyInsightFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__WeeklyInsightClient<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first WeeklyInsight that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyInsightFindFirstArgs} args - Arguments to find a WeeklyInsight
     * @example
     * // Get one WeeklyInsight
     * const weeklyInsight = await prisma.weeklyInsight.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeeklyInsightFindFirstArgs>(args?: Prisma.SelectSubset<T, WeeklyInsightFindFirstArgs<ExtArgs>>): Prisma.Prisma__WeeklyInsightClient<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first WeeklyInsight that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyInsightFindFirstOrThrowArgs} args - Arguments to find a WeeklyInsight
     * @example
     * // Get one WeeklyInsight
     * const weeklyInsight = await prisma.weeklyInsight.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeeklyInsightFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, WeeklyInsightFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__WeeklyInsightClient<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more WeeklyInsights that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyInsightFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeeklyInsights
     * const weeklyInsights = await prisma.weeklyInsight.findMany()
     *
     * // Get first 10 WeeklyInsights
     * const weeklyInsights = await prisma.weeklyInsight.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const weeklyInsightWithIdOnly = await prisma.weeklyInsight.findMany({ select: { id: true } })
     *
     */
    findMany<T extends WeeklyInsightFindManyArgs>(args?: Prisma.SelectSubset<T, WeeklyInsightFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a WeeklyInsight.
     * @param {WeeklyInsightCreateArgs} args - Arguments to create a WeeklyInsight.
     * @example
     * // Create one WeeklyInsight
     * const WeeklyInsight = await prisma.weeklyInsight.create({
     *   data: {
     *     // ... data to create a WeeklyInsight
     *   }
     * })
     *
     */
    create<T extends WeeklyInsightCreateArgs>(args: Prisma.SelectSubset<T, WeeklyInsightCreateArgs<ExtArgs>>): Prisma.Prisma__WeeklyInsightClient<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many WeeklyInsights.
     * @param {WeeklyInsightCreateManyArgs} args - Arguments to create many WeeklyInsights.
     * @example
     * // Create many WeeklyInsights
     * const weeklyInsight = await prisma.weeklyInsight.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends WeeklyInsightCreateManyArgs>(args?: Prisma.SelectSubset<T, WeeklyInsightCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many WeeklyInsights and returns the data saved in the database.
     * @param {WeeklyInsightCreateManyAndReturnArgs} args - Arguments to create many WeeklyInsights.
     * @example
     * // Create many WeeklyInsights
     * const weeklyInsight = await prisma.weeklyInsight.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many WeeklyInsights and only return the `id`
     * const weeklyInsightWithIdOnly = await prisma.weeklyInsight.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends WeeklyInsightCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, WeeklyInsightCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a WeeklyInsight.
     * @param {WeeklyInsightDeleteArgs} args - Arguments to delete one WeeklyInsight.
     * @example
     * // Delete one WeeklyInsight
     * const WeeklyInsight = await prisma.weeklyInsight.delete({
     *   where: {
     *     // ... filter to delete one WeeklyInsight
     *   }
     * })
     *
     */
    delete<T extends WeeklyInsightDeleteArgs>(args: Prisma.SelectSubset<T, WeeklyInsightDeleteArgs<ExtArgs>>): Prisma.Prisma__WeeklyInsightClient<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one WeeklyInsight.
     * @param {WeeklyInsightUpdateArgs} args - Arguments to update one WeeklyInsight.
     * @example
     * // Update one WeeklyInsight
     * const weeklyInsight = await prisma.weeklyInsight.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends WeeklyInsightUpdateArgs>(args: Prisma.SelectSubset<T, WeeklyInsightUpdateArgs<ExtArgs>>): Prisma.Prisma__WeeklyInsightClient<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more WeeklyInsights.
     * @param {WeeklyInsightDeleteManyArgs} args - Arguments to filter WeeklyInsights to delete.
     * @example
     * // Delete a few WeeklyInsights
     * const { count } = await prisma.weeklyInsight.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends WeeklyInsightDeleteManyArgs>(args?: Prisma.SelectSubset<T, WeeklyInsightDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more WeeklyInsights.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyInsightUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeeklyInsights
     * const weeklyInsight = await prisma.weeklyInsight.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends WeeklyInsightUpdateManyArgs>(args: Prisma.SelectSubset<T, WeeklyInsightUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more WeeklyInsights and returns the data updated in the database.
     * @param {WeeklyInsightUpdateManyAndReturnArgs} args - Arguments to update many WeeklyInsights.
     * @example
     * // Update many WeeklyInsights
     * const weeklyInsight = await prisma.weeklyInsight.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more WeeklyInsights and only return the `id`
     * const weeklyInsightWithIdOnly = await prisma.weeklyInsight.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends WeeklyInsightUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, WeeklyInsightUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one WeeklyInsight.
     * @param {WeeklyInsightUpsertArgs} args - Arguments to update or create a WeeklyInsight.
     * @example
     * // Update or create a WeeklyInsight
     * const weeklyInsight = await prisma.weeklyInsight.upsert({
     *   create: {
     *     // ... data to create a WeeklyInsight
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeeklyInsight we want to update
     *   }
     * })
     */
    upsert<T extends WeeklyInsightUpsertArgs>(args: Prisma.SelectSubset<T, WeeklyInsightUpsertArgs<ExtArgs>>): Prisma.Prisma__WeeklyInsightClient<runtime.Types.Result.GetResult<Prisma.$WeeklyInsightPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of WeeklyInsights.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyInsightCountArgs} args - Arguments to filter WeeklyInsights to count.
     * @example
     * // Count the number of WeeklyInsights
     * const count = await prisma.weeklyInsight.count({
     *   where: {
     *     // ... the filter for the WeeklyInsights we want to count
     *   }
     * })
    **/
    count<T extends WeeklyInsightCountArgs>(args?: Prisma.Subset<T, WeeklyInsightCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], WeeklyInsightCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a WeeklyInsight.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyInsightAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WeeklyInsightAggregateArgs>(args: Prisma.Subset<T, WeeklyInsightAggregateArgs>): Prisma.PrismaPromise<GetWeeklyInsightAggregateType<T>>;
    /**
     * Group by WeeklyInsight.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyInsightGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends WeeklyInsightGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: WeeklyInsightGroupByArgs['orderBy'];
    } : {
        orderBy?: WeeklyInsightGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, WeeklyInsightGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeeklyInsightGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the WeeklyInsight model
     */
    readonly fields: WeeklyInsightFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for WeeklyInsight.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__WeeklyInsightClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the WeeklyInsight model
 */
export interface WeeklyInsightFieldRefs {
    readonly id: Prisma.FieldRef<"WeeklyInsight", 'String'>;
    readonly userId: Prisma.FieldRef<"WeeklyInsight", 'String'>;
    readonly weekStart: Prisma.FieldRef<"WeeklyInsight", 'DateTime'>;
    readonly weekEnd: Prisma.FieldRef<"WeeklyInsight", 'DateTime'>;
    readonly peakHours: Prisma.FieldRef<"WeeklyInsight", 'Int[]'>;
    readonly lowProductivityDays: Prisma.FieldRef<"WeeklyInsight", 'String[]'>;
    readonly weekOverWeekTrend: Prisma.FieldRef<"WeeklyInsight", 'String'>;
    readonly averageDailyMinutes: Prisma.FieldRef<"WeeklyInsight", 'Int'>;
    readonly totalSessions: Prisma.FieldRef<"WeeklyInsight", 'Int'>;
    readonly completedFocusSessions: Prisma.FieldRef<"WeeklyInsight", 'Int'>;
    readonly habitCorrelations: Prisma.FieldRef<"WeeklyInsight", 'Json'>;
    readonly insights: Prisma.FieldRef<"WeeklyInsight", 'Json'>;
    readonly recommendations: Prisma.FieldRef<"WeeklyInsight", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"WeeklyInsight", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"WeeklyInsight", 'DateTime'>;
}
/**
 * WeeklyInsight findUnique
 */
export type WeeklyInsightFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyInsight to fetch.
     */
    where: Prisma.WeeklyInsightWhereUniqueInput;
};
/**
 * WeeklyInsight findUniqueOrThrow
 */
export type WeeklyInsightFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyInsight to fetch.
     */
    where: Prisma.WeeklyInsightWhereUniqueInput;
};
/**
 * WeeklyInsight findFirst
 */
export type WeeklyInsightFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyInsight to fetch.
     */
    where?: Prisma.WeeklyInsightWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WeeklyInsights to fetch.
     */
    orderBy?: Prisma.WeeklyInsightOrderByWithRelationInput | Prisma.WeeklyInsightOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WeeklyInsights.
     */
    cursor?: Prisma.WeeklyInsightWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WeeklyInsights from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WeeklyInsights.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WeeklyInsights.
     */
    distinct?: Prisma.WeeklyInsightScalarFieldEnum | Prisma.WeeklyInsightScalarFieldEnum[];
};
/**
 * WeeklyInsight findFirstOrThrow
 */
export type WeeklyInsightFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyInsight to fetch.
     */
    where?: Prisma.WeeklyInsightWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WeeklyInsights to fetch.
     */
    orderBy?: Prisma.WeeklyInsightOrderByWithRelationInput | Prisma.WeeklyInsightOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for WeeklyInsights.
     */
    cursor?: Prisma.WeeklyInsightWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WeeklyInsights from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WeeklyInsights.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of WeeklyInsights.
     */
    distinct?: Prisma.WeeklyInsightScalarFieldEnum | Prisma.WeeklyInsightScalarFieldEnum[];
};
/**
 * WeeklyInsight findMany
 */
export type WeeklyInsightFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * Filter, which WeeklyInsights to fetch.
     */
    where?: Prisma.WeeklyInsightWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of WeeklyInsights to fetch.
     */
    orderBy?: Prisma.WeeklyInsightOrderByWithRelationInput | Prisma.WeeklyInsightOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing WeeklyInsights.
     */
    cursor?: Prisma.WeeklyInsightWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` WeeklyInsights from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` WeeklyInsights.
     */
    skip?: number;
    distinct?: Prisma.WeeklyInsightScalarFieldEnum | Prisma.WeeklyInsightScalarFieldEnum[];
};
/**
 * WeeklyInsight create
 */
export type WeeklyInsightCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * The data needed to create a WeeklyInsight.
     */
    data: Prisma.XOR<Prisma.WeeklyInsightCreateInput, Prisma.WeeklyInsightUncheckedCreateInput>;
};
/**
 * WeeklyInsight createMany
 */
export type WeeklyInsightCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many WeeklyInsights.
     */
    data: Prisma.WeeklyInsightCreateManyInput | Prisma.WeeklyInsightCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * WeeklyInsight createManyAndReturn
 */
export type WeeklyInsightCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * The data used to create many WeeklyInsights.
     */
    data: Prisma.WeeklyInsightCreateManyInput | Prisma.WeeklyInsightCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * WeeklyInsight update
 */
export type WeeklyInsightUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * The data needed to update a WeeklyInsight.
     */
    data: Prisma.XOR<Prisma.WeeklyInsightUpdateInput, Prisma.WeeklyInsightUncheckedUpdateInput>;
    /**
     * Choose, which WeeklyInsight to update.
     */
    where: Prisma.WeeklyInsightWhereUniqueInput;
};
/**
 * WeeklyInsight updateMany
 */
export type WeeklyInsightUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update WeeklyInsights.
     */
    data: Prisma.XOR<Prisma.WeeklyInsightUpdateManyMutationInput, Prisma.WeeklyInsightUncheckedUpdateManyInput>;
    /**
     * Filter which WeeklyInsights to update
     */
    where?: Prisma.WeeklyInsightWhereInput;
    /**
     * Limit how many WeeklyInsights to update.
     */
    limit?: number;
};
/**
 * WeeklyInsight updateManyAndReturn
 */
export type WeeklyInsightUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * The data used to update WeeklyInsights.
     */
    data: Prisma.XOR<Prisma.WeeklyInsightUpdateManyMutationInput, Prisma.WeeklyInsightUncheckedUpdateManyInput>;
    /**
     * Filter which WeeklyInsights to update
     */
    where?: Prisma.WeeklyInsightWhereInput;
    /**
     * Limit how many WeeklyInsights to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * WeeklyInsight upsert
 */
export type WeeklyInsightUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * The filter to search for the WeeklyInsight to update in case it exists.
     */
    where: Prisma.WeeklyInsightWhereUniqueInput;
    /**
     * In case the WeeklyInsight found by the `where` argument doesn't exist, create a new WeeklyInsight with this data.
     */
    create: Prisma.XOR<Prisma.WeeklyInsightCreateInput, Prisma.WeeklyInsightUncheckedCreateInput>;
    /**
     * In case the WeeklyInsight was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.WeeklyInsightUpdateInput, Prisma.WeeklyInsightUncheckedUpdateInput>;
};
/**
 * WeeklyInsight delete
 */
export type WeeklyInsightDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
    /**
     * Filter which WeeklyInsight to delete.
     */
    where: Prisma.WeeklyInsightWhereUniqueInput;
};
/**
 * WeeklyInsight deleteMany
 */
export type WeeklyInsightDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which WeeklyInsights to delete
     */
    where?: Prisma.WeeklyInsightWhereInput;
    /**
     * Limit how many WeeklyInsights to delete.
     */
    limit?: number;
};
/**
 * WeeklyInsight without action
 */
export type WeeklyInsightDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyInsight
     */
    select?: Prisma.WeeklyInsightSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WeeklyInsight
     */
    omit?: Prisma.WeeklyInsightOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WeeklyInsightInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=WeeklyInsight.d.ts.map