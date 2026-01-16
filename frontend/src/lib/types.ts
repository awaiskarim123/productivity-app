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

export interface Task {
	id: string;
	userId: string;
	title: string;
	description: string | null;
	completed: boolean;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	dueDate: string | null;
	category: string | null;
	createdAt: string;
	updatedAt: string;
	completedAt: string | null;
	deletedAt: string | null;
}

export interface TaskStats {
	total: number;
	completed: number;
	overdue: number;
	today: number;
	thisWeek: number;
}

export interface Habit {
	id: string;
	userId: string;
	name: string;
	description: string | null;
	color: string;
	icon: string | null;
	targetDays: number;
	streak: number;
	bestStreak: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	logs?: HabitLog[];
}

export interface HabitLog {
	id: string;
	habitId: string;
	date: string;
	notes: string | null;
	createdAt: string;
}

export interface HabitStats {
	totalLogs: number;
	weekLogs: number;
	monthLogs: number;
	yearLogs: number;
	streak: number;
	bestStreak: number;
}

export interface Note {
	id: string;
	userId: string;
	title: string;
	content: string;
	tags: string[];
	isPinned: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface WeeklyInsight {
	weekStart: string;
	weekEnd: string;
	peakHours: number[];
	lowProductivityDays: string[];
	weekOverWeekTrend: 'improving' | 'declining' | 'stable';
	averageDailyMinutes: number;
	totalSessions: number;
	completedFocusSessions: number;
	habitCorrelations?: Array<{
		habitId: string;
		habitName: string;
		impact: 'positive' | 'neutral' | 'negative';
		correlationScore: number;
	}>;
	insights: Array<{
		type: string;
		title: string;
		description: string;
		confidence: 'low' | 'medium' | 'high';
	}>;
	recommendations: Array<{
		type: string;
		title: string;
		description: string;
		confidence: 'low' | 'medium' | 'high';
	}>;
}

export interface RecommendationsResponse {
	recommendations: Array<{
		type: string;
		title: string;
		description: string;
		confidence: 'low' | 'medium' | 'high';
	}>;
	habitCorrelations: Array<{
		habitId: string;
		habitName: string;
		impact: 'positive' | 'neutral' | 'negative';
		correlationScore: number;
	}>;
}

export interface KeyResult {
	id: string;
	goalId: string;
	title: string;
	description: string | null;
	targetValue: number;
	currentValue: number;
	progressPercent: number;
	weight: number;
	createdAt: string;
	updatedAt: string;
}

export interface Goal {
	id: string;
	userId: string;
	title: string;
	description: string | null;
	type: 'QUARTERLY' | 'MONTHLY';
	startDate: string;
	endDate: string;
	targetValue: number;
	currentValue: number;
	progressPercent: number;
	healthStatus: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	keyResults?: KeyResult[];
	_count?: {
		tasks: number;
		habits: number;
		focusSessions: number;
	};
}

export interface GoalContributions {
	tasks: {
		total: number;
		completed: number;
		contribution: number;
		items: Array<{
			id: string;
			title: string;
			completed: boolean;
			completedAt: string | null;
			priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
		}>;
	};
	habits: {
		total: number;
		logs: number;
		contribution: number;
		items: Array<{
			id: string;
			name: string;
			logCount: number;
		}>;
	};
	focusSessions: {
		total: number;
		totalMinutes: number;
		contribution: number;
		items: Array<{
			id: string;
			startedAt: string;
			durationMinutes: number | null;
			completed: boolean;
		}>;
	};
	keyResults: Array<{
		id: string;
		title: string;
		currentValue: number;
		targetValue: number;
		progressPercent: number;
	}>;
}

export interface GoalTimeline {
	goal: {
		id: string;
		title: string;
		startDate: string;
		endDate: string;
		currentProgress: number;
	};
	timeline: Array<{
		date: string;
		progress: number;
		tasksCompleted: number;
		habitLogs: number;
		focusMinutes: number;
	}>;
}
