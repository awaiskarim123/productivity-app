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

	const url = `${API_BASE_URL}${path}`;
	
	try {
		let response = await fetch(url, {
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
				response = await fetch(url, {
					...options,
					method,
					headers,
					body
				});
			}
		}

		if (!response.ok) {
			const errorBody = await response.json().catch(() => ({}));
			const errorMessage = errorBody.message ?? `Request failed with status ${response.status}`;
			console.error(`API Error [${method} ${path}]:`, {
				status: response.status,
				statusText: response.statusText,
				message: errorMessage,
				errors: errorBody.errors
			});
			throw new Error(errorMessage);
		}

		return parseResponse<T>(response);
	} catch (error) {
		if (error instanceof TypeError && error.message.includes('fetch')) {
			console.error(`Network Error [${method} ${path}]:`, {
				url,
				error: error.message
			});
			throw new Error(`Unable to connect to API. Please ensure the backend server is running at ${API_BASE_URL}`);
		}
		throw error;
	}
}

