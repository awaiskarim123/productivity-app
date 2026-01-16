import { apiFetch } from './client';
import type {
	AnalyticsOverview,
	FocusSession,
	FocusStats,
	Quote,
	TimeSummary,
	User,
	WorkSession,
	WorkSummaryPoint,
	Task,
	TaskStats,
	Habit,
	HabitLog,
	HabitStats,
	Note,
	WeeklyInsight,
	RecommendationsResponse,
	Goal,
	KeyResult,
	GoalContributions,
	GoalTimeline
} from '../types';

export async function fetchProfile(): Promise<{ profile: User; summary: TimeSummary }> {
	return apiFetch('/profile', { method: 'GET' });
}

export async function updateProfile(payload: Partial<Pick<User, 'name' | 'dailyGoalMinutes'>>) {
	return apiFetch<{ profile: User }>('/profile', { method: 'PATCH', body: payload });
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
	return apiFetch<{ message: string }>('/profile/password', { method: 'PATCH', body: payload });
}

export async function startWorkSession(payload: { notes?: string; startedAt?: string }) {
	return apiFetch<{ session: WorkSession }>('/work/start', { method: 'POST', body: payload });
}

export async function endWorkSession(payload: { sessionId: string; endedAt?: string; notes?: string }) {
	return apiFetch<{ session: WorkSession; summary: TimeSummary; focusStreak: number }>(
		'/work/end',
		{
			method: 'POST',
			body: payload
		}
	);
}

export async function fetchWorkSessions(params: { from?: string; to?: string; limit?: number } = {}) {
	const query = new URLSearchParams();
	if (params.from) query.set('from', params.from);
	if (params.to) query.set('to', params.to);
	if (params.limit) query.set('limit', params.limit.toString());

	const suffix = query.toString() ? `?${query.toString()}` : '';
	return apiFetch<{ sessions: WorkSession[] }>(`/work/sessions${suffix}`, { method: 'GET' });
}

export async function fetchWorkSession(id: string) {
	return apiFetch<{ session: WorkSession }>(`/work/${id}`, { method: 'GET' });
}

export async function updateWorkSession(id: string, payload: {
	notes?: string;
	startedAt?: string;
	endedAt?: string | null;
}) {
	return apiFetch<{ session: WorkSession }>(`/work/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteWorkSession(id: string) {
	return apiFetch(`/work/${id}`, { method: 'DELETE' });
}

export async function fetchWorkSummary(period: 'daily' | 'weekly' | 'monthly') {
	return apiFetch<WorkSummaryPoint>(`/work/summary?period=${period}`, { method: 'GET' });
}

export async function fetchActiveFocusSession() {
	return apiFetch<{ activeSession: FocusSession | null }>('/focus/active', { method: 'GET' });
}

export async function startFocusSession(payload: {
	mode?: 'FOCUS' | 'BREAK';
	targetMinutes: number;
	startedAt?: string;
	notes?: string;
}) {
	return apiFetch<{ session: FocusSession }>('/focus/start', { method: 'POST', body: payload });
}

export async function endFocusSession(payload: {
	sessionId: string;
	endedAt?: string;
	completed?: boolean;
	distractions?: number;
	notes?: string;
}) {
	return apiFetch<{ session: FocusSession }>('/focus/end', { method: 'POST', body: payload });
}

export async function fetchFocusSessions(params: {
	from?: string;
	to?: string;
	mode?: 'FOCUS' | 'BREAK';
	limit?: number;
	offset?: number;
} = {}) {
	const query = new URLSearchParams();
	if (params.from) query.set('from', params.from);
	if (params.to) query.set('to', params.to);
	if (params.mode) query.set('mode', params.mode);
	if (params.limit) query.set('limit', params.limit.toString());
	if (params.offset) query.set('offset', params.offset.toString());

	const suffix = query.toString() ? `?${query.toString()}` : '';
	return apiFetch<{ sessions: FocusSession[]; total: number; limit: number; offset: number }>(
		`/focus/sessions${suffix}`,
		{ method: 'GET' }
	);
}

export async function fetchFocusSession(id: string) {
	return apiFetch<{ session: FocusSession }>(`/focus/${id}`, { method: 'GET' });
}

export async function updateFocusSession(id: string, payload: {
	notes?: string | null;
	distractions?: number;
	completed?: boolean;
}) {
	return apiFetch<{ session: FocusSession }>(`/focus/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteFocusSession(id: string) {
	return apiFetch(`/focus/${id}`, { method: 'DELETE' });
}

export async function fetchFocusStats(rangeDays = 14) {
	return apiFetch<FocusStats>(`/focus/stats?rangeDays=${rangeDays}`, { method: 'GET' });
}

export async function fetchAnalyticsOverview() {
	return apiFetch<AnalyticsOverview>('/analytics/overview', { method: 'GET' });
}

export async function fetchMotivationQuote() {
	return apiFetch<{ quote: Quote }>('/motivation/quote', { method: 'GET' });
}

// Tasks API
export async function createTask(payload: {
	title: string;
	description?: string;
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	dueDate?: string;
	category?: string;
}) {
	return apiFetch<{ task: Task }>('/tasks', { method: 'POST', body: payload });
}

export async function fetchTasks(params: {
	completed?: boolean;
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	category?: string;
	limit?: number;
	offset?: number;
} = {}) {
	const query = new URLSearchParams();
	if (params.completed !== undefined) query.set('completed', params.completed.toString());
	if (params.priority) query.set('priority', params.priority);
	if (params.category) query.set('category', params.category);
	if (params.limit) query.set('limit', params.limit.toString());
	if (params.offset) query.set('offset', params.offset.toString());

	const suffix = query.toString() ? `?${query.toString()}` : '';
	return apiFetch<{ tasks: Task[]; total: number; limit: number; offset: number }>(`/tasks${suffix}`, { method: 'GET' });
}

export async function fetchTask(id: string) {
	return apiFetch<{ task: Task }>(`/tasks/${id}`, { method: 'GET' });
}

export async function updateTask(id: string, payload: {
	title?: string;
	description?: string;
	completed?: boolean;
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	dueDate?: string | null;
	category?: string | null;
}) {
	return apiFetch<{ task: Task }>(`/tasks/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteTask(id: string) {
	return apiFetch(`/tasks/${id}`, { method: 'DELETE' });
}

export async function fetchTaskStats() {
	return apiFetch<TaskStats>('/tasks/stats/summary', { method: 'GET' });
}

// Habits API
export async function createHabit(payload: {
	name: string;
	description?: string;
	color?: string;
	icon?: string;
	targetDays?: number;
}) {
	return apiFetch<{ habit: Habit }>('/habits', { method: 'POST', body: payload });
}

export async function fetchHabits(params: { isActive?: boolean } = {}) {
	const query = new URLSearchParams();
	if (params.isActive !== undefined) query.set('isActive', params.isActive.toString());

	const suffix = query.toString() ? `?${query.toString()}` : '';
	return apiFetch<{ habits: Habit[] }>(`/habits${suffix}`, { method: 'GET' });
}

export async function fetchHabit(id: string) {
	return apiFetch<{ habit: Habit }>(`/habits/${id}`, { method: 'GET' });
}

export async function updateHabit(id: string, payload: {
	name?: string;
	description?: string | null;
	color?: string;
	icon?: string | null;
	targetDays?: number;
	isActive?: boolean;
}) {
	return apiFetch<{ habit: Habit }>(`/habits/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteHabit(id: string) {
	return apiFetch(`/habits/${id}`, { method: 'DELETE' });
}

export async function logHabit(id: string, payload: { date?: string; notes?: string }) {
	return apiFetch<{ log: HabitLog; habit: Habit }>(`/habits/${id}/log`, { method: 'POST', body: payload });
}

export async function deleteHabitLog(habitId: string, logId: string) {
	return apiFetch<{ habit: Habit }>(`/habits/${habitId}/log/${logId}`, { method: 'DELETE' });
}

export async function fetchHabitLogs(id: string, params: {
	from?: string;
	to?: string;
	limit?: number;
	offset?: number;
} = {}) {
	const query = new URLSearchParams();
	if (params.from) query.set('from', params.from);
	if (params.to) query.set('to', params.to);
	if (params.limit) query.set('limit', params.limit.toString());
	if (params.offset) query.set('offset', params.offset.toString());

	const suffix = query.toString() ? `?${query.toString()}` : '';
	return apiFetch<{ logs: HabitLog[]; total: number; limit: number; offset: number }>(
		`/habits/${id}/logs${suffix}`,
		{ method: 'GET' }
	);
}

export async function fetchHabitStats(id: string) {
	return apiFetch<HabitStats>(`/habits/${id}/stats`, { method: 'GET' });
}

// Notes API
export async function createNote(payload: {
	title: string;
	content: string;
	tags?: string[];
	isPinned?: boolean;
}) {
	return apiFetch<{ note: Note }>('/notes', { method: 'POST', body: payload });
}

export async function fetchNotes(params: {
	search?: string;
	tag?: string;
	isPinned?: boolean;
	limit?: number;
	offset?: number;
} = {}) {
	const query = new URLSearchParams();
	if (params.search) query.set('search', params.search);
	if (params.tag) query.set('tag', params.tag);
	if (params.isPinned !== undefined) query.set('isPinned', params.isPinned.toString());
	if (params.limit) query.set('limit', params.limit.toString());
	if (params.offset) query.set('offset', params.offset.toString());

	const suffix = query.toString() ? `?${query.toString()}` : '';
	return apiFetch<{ notes: Note[]; total: number; limit: number; offset: number }>(`/notes${suffix}`, { method: 'GET' });
}

export async function fetchNote(id: string) {
	return apiFetch<{ note: Note }>(`/notes/${id}`, { method: 'GET' });
}

export async function updateNote(id: string, payload: {
	title?: string;
	content?: string;
	tags?: string[];
	isPinned?: boolean;
}) {
	return apiFetch<{ note: Note }>(`/notes/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteNote(id: string) {
	return apiFetch(`/notes/${id}`, { method: 'DELETE' });
}

export async function fetchAllTags() {
	return apiFetch<{ tags: string[] }>('/notes/tags/all', { method: 'GET' });
}

// Weekly Insights API
export async function fetchWeeklyInsights(weekStart?: string) {
	const query = weekStart ? `?weekStart=${weekStart}` : '';
	return apiFetch<WeeklyInsight>(`/analytics/weekly-insights${query}`, { method: 'GET' });
}

export async function fetchRecommendations() {
	return apiFetch<RecommendationsResponse>('/analytics/recommendations', { method: 'GET' });
}

// Goals API
export async function createGoal(payload: {
	title: string;
	description?: string;
	type: 'QUARTERLY' | 'MONTHLY';
	startDate: string;
	endDate: string;
	targetValue?: number;
	keyResults?: Array<{
		title: string;
		description?: string;
		targetValue: number;
		weight?: number;
	}>;
}) {
	return apiFetch<{ goal: Goal }>('/goals', { method: 'POST', body: payload });
}

export async function fetchGoals(params: {
	type?: 'QUARTERLY' | 'MONTHLY';
	isActive?: boolean;
	limit?: number;
	offset?: number;
} = {}) {
	const query = new URLSearchParams();
	if (params.type) query.set('type', params.type);
	if (params.isActive !== undefined) query.set('isActive', params.isActive.toString());
	if (params.limit) query.set('limit', params.limit.toString());
	if (params.offset) query.set('offset', params.offset.toString());

	const suffix = query.toString() ? `?${query.toString()}` : '';
	return apiFetch<{ goals: Goal[]; total: number; limit: number; offset: number }>(`/goals${suffix}`, { method: 'GET' });
}

export async function fetchGoal(id: string) {
	return apiFetch<{ goal: Goal }>(`/goals/${id}`, { method: 'GET' });
}

export async function updateGoal(id: string, payload: {
	title?: string;
	description?: string;
	startDate?: string;
	endDate?: string;
	targetValue?: number;
	isActive?: boolean;
}) {
	return apiFetch<{ goal: Goal }>(`/goals/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteGoal(id: string) {
	return apiFetch(`/goals/${id}`, { method: 'DELETE' });
}

export async function createKeyResult(goalId: string, payload: {
	title: string;
	description?: string;
	targetValue: number;
	weight?: number;
}) {
	return apiFetch<{ keyResult: KeyResult }>(`/goals/${goalId}/key-results`, { method: 'POST', body: payload });
}

export async function updateKeyResult(id: string, payload: {
	title?: string;
	description?: string;
	targetValue?: number;
	currentValue?: number;
	weight?: number;
}) {
	return apiFetch<{ keyResult: KeyResult }>(`/goals/key-results/${id}`, { method: 'PATCH', body: payload });
}

export async function deleteKeyResult(id: string) {
	return apiFetch(`/goals/key-results/${id}`, { method: 'DELETE' });
}

export async function linkTaskToGoal(goalId: string, taskId: string) {
	return apiFetch<{ message: string }>(`/goals/${goalId}/link/task/${taskId}`, { method: 'POST' });
}

export async function linkHabitToGoal(goalId: string, habitId: string) {
	return apiFetch<{ message: string }>(`/goals/${goalId}/link/habit/${habitId}`, { method: 'POST' });
}

export async function linkFocusSessionToGoal(goalId: string, sessionId: string) {
	return apiFetch<{ message: string }>(`/goals/${goalId}/link/focus-session/${sessionId}`, { method: 'POST' });
}

export async function unlinkTaskFromGoal(goalId: string, taskId: string) {
	return apiFetch<{ message: string }>(`/goals/${goalId}/unlink/task/${taskId}`, { method: 'DELETE' });
}

export async function unlinkHabitFromGoal(goalId: string, habitId: string) {
	return apiFetch<{ message: string }>(`/goals/${goalId}/unlink/habit/${habitId}`, { method: 'DELETE' });
}

export async function unlinkFocusSessionFromGoal(goalId: string, sessionId: string) {
	return apiFetch<{ message: string }>(`/goals/${goalId}/unlink/focus-session/${sessionId}`, { method: 'DELETE' });
}

export async function fetchGoalContributions(id: string) {
	return apiFetch<{ contributions: GoalContributions }>(`/goals/${id}/contributions`, { method: 'GET' });
}

export async function fetchGoalTimeline(id: string) {
	return apiFetch<{ timeline: GoalTimeline }>(`/goals/${id}/timeline`, { method: 'GET' });
}

export async function recalculateGoalProgress(id: string) {
	return apiFetch<{ goal: Goal }>(`/goals/${id}/recalculate`, { method: 'POST' });
}
