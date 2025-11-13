export interface User {
	id: string;
	email: string;
	name: string | null;
	dailyGoalMinutes: number;
	focusStreak: number;
	createdAt: string;
}

export interface WorkSession {
	id: string;
	userId: string;
	startedAt: string;
	endedAt: string | null;
	durationMinutes: number | null;
	notes: string | null;
}

export interface FocusSession {
	id: string;
	userId: string;
	mode: 'FOCUS' | 'BREAK';
	startedAt: string;
	endedAt: string | null;
	targetMinutes: number;
	durationMinutes: number | null;
	completed: boolean;
	distractions: number;
	notes: string | null;
}

export interface TimeSummary {
	todayMinutes: number;
	weeklyMinutes: number;
	monthlyMinutes: number;
	totalMinutes: number;
}

export interface AnalyticsOverview {
	summary: TimeSummary;
	focus: {
		totalMinutes: number;
		breakMinutes: number;
		completionRate: number;
		averageFocusMinutes: number;
		totalSessions: number;
		completedSessions: number;
		distractions: number;
	};
	streak: number;
	productivityTrend: Array<{ date: string; minutes: number }>;
	suggestions: string[];
}

export interface FocusStats {
	rangeDays: number;
	totalFocusMinutes: number;
	completedSessions: number;
	totalDistractions: number;
	daily: Array<{
		date: string;
		focusMinutes: number;
		breakMinutes: number;
		distractions: number;
	}>;
}

export interface WorkSummaryPoint {
	period: 'daily' | 'weekly' | 'monthly';
	summary: Array<{ periodStart: string; minutes: number }>;
}

export interface Quote {
	text: string;
	author: string | null;
}

export interface AuthResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
}

