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
	Note
} from '../types';

export async function fetchProfile(): Promise<{ profile: User; summary: TimeSummary }> {
	return apiFetch('/profile', { method: 'GET' });
}

export async function updateProfile(payload: Partial<Pick<User, 'name' | 'dailyGoalMinutes'>>) {
	return apiFetch<{ profile: User }>('/profile', { method: 'PATCH', body: payload });
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

