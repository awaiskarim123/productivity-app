import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { get, writable } from 'svelte/store';
import { API_BASE_URL, STORAGE_KEY } from '../config';
import type { AuthResponse, User } from '../types';

export interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	initialized: boolean;
	loading: boolean;
	error: string | null;
}

const defaultState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	initialized: false,
	loading: false,
	error: null
};

function persist(state: AuthState) {
	if (!browser) return;
	const { accessToken, refreshToken, user } = state;
	if (accessToken && refreshToken && user) {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ accessToken, refreshToken, user })
		);
	} else {
		localStorage.removeItem(STORAGE_KEY);
	}
}

async function requestAuth(endpoint: string, payload: Record<string, unknown>) {
	const url = `${API_BASE_URL}${endpoint}`;
	
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const errorBody = await response.json().catch(() => ({}));
			const errorMessage = errorBody.message ?? `Authentication failed with status ${response.status}`;
			console.error(`Auth Error [POST ${endpoint}]:`, {
				status: response.status,
				statusText: response.statusText,
				message: errorMessage,
				errors: errorBody.errors
			});
			throw new Error(errorMessage);
		}

		return (await response.json()) as AuthResponse;
	} catch (error) {
		if (error instanceof TypeError && error.message.includes('fetch')) {
			console.error(`Network Error [POST ${endpoint}]:`, {
				url,
				error: error.message
			});
			throw new Error(`Unable to connect to API. Please ensure the backend server is running at ${API_BASE_URL}`);
		}
		throw error;
	}
}

function createAuthStore() {
	const store = writable<AuthState>({ ...defaultState });

	function setAuth(data: AuthResponse) {
		const nextState: AuthState = {
			user: data.user,
			accessToken: data.accessToken,
			refreshToken: data.refreshToken,
			initialized: true,
			loading: false,
			error: null
		};
		store.set(nextState);
		persist(nextState);
	}

	function setError(message: string) {
		store.update((state) => ({ ...state, loading: false, error: message }));
	}

	return {
		subscribe: store.subscribe,
		initialize() {
			if (!browser) return;
			const cached = localStorage.getItem(STORAGE_KEY);
			if (cached) {
				try {
					const parsed = JSON.parse(cached) as {
						user: User;
						accessToken: string;
						refreshToken: string;
					};
					store.set({
						user: parsed.user,
						accessToken: parsed.accessToken,
						refreshToken: parsed.refreshToken,
						initialized: true,
						loading: false,
						error: null
					});
					return;
				} catch {
					localStorage.removeItem(STORAGE_KEY);
				}
			}
			store.set({ ...defaultState, initialized: true });
		},
		async login(email: string, password: string) {
			store.update((state) => ({ ...state, loading: true, error: null }));
			try {
				const data = await requestAuth('/auth/login', { email, password });
				setAuth(data);
				return data.user;
			} catch (error) {
				setError(error instanceof Error ? error.message : 'Login failed');
				throw error;
			}
		},
		async register(payload: { email: string; password: string; name?: string; dailyGoalMinutes?: number }) {
			store.update((state) => ({ ...state, loading: true, error: null }));
			try {
				const data = await requestAuth('/auth/register', payload);
				setAuth(data);
				return data.user;
			} catch (error) {
				setError(error instanceof Error ? error.message : 'Registration failed');
				throw error;
			}
		},
		async refresh(): Promise<boolean> {
			const state = get(store);
			if (!state.refreshToken) return false;

			try {
				const response = await requestAuth('/auth/refresh', {
					refreshToken: state.refreshToken
				});
				setAuth(response);
				return true;
			} catch (error) {
				console.error('Token refresh failed', error);
				this.clear(false);
				return false;
			}
		},
		async logout() {
			const state = get(store);
			if (state.refreshToken) {
				try {
					await requestAuth('/auth/logout', { refreshToken: state.refreshToken });
				} catch (error) {
					console.error('Logout error', error);
				}
			}
			this.clear();
			goto('/login');
		},
		setUser(user: User) {
			store.update((state) => {
				const nextState = { ...state, user };
				persist(nextState);
				return nextState;
			});
		},
		setTokens(tokens: { accessToken: string; refreshToken: string }) {
			store.update((state) => {
				const nextState = { ...state, ...tokens };
				persist(nextState);
				return nextState;
			});
		},
		clear(clearStorage = true) {
			store.set({ ...defaultState, initialized: true });
			if (clearStorage && browser) {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	};
}

export const authStore = createAuthStore();

