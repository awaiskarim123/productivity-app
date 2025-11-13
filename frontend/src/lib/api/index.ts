import { apiFetch } from './client';
import type {
	AnalyticsOverview,
	FocusSession,
	FocusStats,
	Quote,
	TimeSummary,
	User,
	WorkSession,
	WorkSummaryPoint
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

