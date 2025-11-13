import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';
import { API_BASE_URL } from '../config';

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ApiRequestOptions = Omit<RequestInit, 'body' | 'method'> & {
	method?: ApiMethod;
	body?: Record<string, unknown> | FormData | string | null;
	auth?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
	const contentType = response.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		return (await response.json()) as T;
	}
	return (await response.text()) as unknown as T;
}

export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
	const { auth = true, method = 'GET' } = options;
	const headers = new Headers(options.headers);
	const state = get(authStore);

	let body: BodyInit | undefined = undefined;
	if (options.body instanceof FormData) {
		body = options.body;
	} else if (typeof options.body === 'string') {
		headers.set('Content-Type', 'application/json');
		body = options.body;
	} else if (options.body) {
		headers.set('Content-Type', 'application/json');
		body = JSON.stringify(options.body);
	}

	if (auth && state.accessToken) {
		headers.set('Authorization', `Bearer ${state.accessToken}`);
	}

	let response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		method,
		headers,
		body
	});

	if (response.status === 401 && auth && state.refreshToken) {
		const refreshed = await authStore.refresh();
		if (refreshed) {
			const refreshedState = get(authStore);
			headers.set('Authorization', `Bearer ${refreshedState.accessToken}`);
			response = await fetch(`${API_BASE_URL}${path}`, {
				...options,
				method,
				headers,
				body
			});
		}
	}

	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		throw new Error(errorBody.message ?? 'Request failed');
	}

	return parseResponse<T>(response);
}

