import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';
import { API_BASE_URL } from '$lib/api-config';

type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ApiRequestOptions = Omit<RequestInit, 'body' | 'method'> & {
	method?: ApiMethod;
	body?: Record<string, unknown> | FormData | string | null;
	auth?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
	// Check content-length first to avoid reading empty bodies
	const contentLength = response.headers.get('content-length');
	if (contentLength === '0') {
		return undefined as T;
	}

	// Get the response text (can only read once)
	const text = await response.text();
	
	// If empty text, return undefined
	if (!text || text.trim() === '') {
		return undefined as T;
	}

	// Try to parse as JSON if content-type suggests it
	const contentType = response.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		try {
			return JSON.parse(text) as T;
		} catch (error) {
			// If JSON parsing fails but we have text, return the text
			// This handles cases where server sends non-JSON in JSON content-type
			return text as unknown as T;
		}
	}
	
	return text as unknown as T;
}

export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
	const { auth = true, method = 'GET' } = options;
	const headers = new Headers(options.headers);
	const state = get(authStore);

	let body: BodyInit | undefined = undefined;
	// Only set body and Content-Type for methods that support it
	if (method !== 'GET' && method !== 'DELETE') {
	if (options.body instanceof FormData) {
		body = options.body;
	} else if (typeof options.body === 'string') {
		headers.set('Content-Type', 'application/json');
		body = options.body;
	} else if (options.body) {
		headers.set('Content-Type', 'application/json');
		body = JSON.stringify(options.body);
		}
	} else if (options.body && method === 'DELETE') {
		// Some DELETE requests might have a body (though rare)
		if (typeof options.body === 'string') {
			headers.set('Content-Type', 'application/json');
			body = options.body;
		} else if (options.body) {
			headers.set('Content-Type', 'application/json');
			body = JSON.stringify(options.body);
		}
	}

	if (auth && state.accessToken) {
		headers.set('Authorization', `Bearer ${state.accessToken}`);
	}

	const url = `${API_BASE_URL}${path}`;
	
	// Build fetch options explicitly, excluding body and method from spread
	// For DELETE requests without a body, explicitly set body to undefined to avoid issues
	const fetchOptions: RequestInit = {
			method,
			headers,
		body: method === 'DELETE' && !body ? undefined : body,
		credentials: options.credentials || 'include',
		cache: options.cache,
		mode: options.mode || 'cors',
		redirect: options.redirect,
		referrer: options.referrer,
		referrerPolicy: options.referrerPolicy,
		signal: options.signal
	};

	// TODO: Add a check to see if the refresh token is expired
	// If it is, return false and clear the store
	// If it is not, refresh the token
	// If the refresh token is invalid, return false and clear the store
	// If the refresh token is valid, set the new tokens and return true

	try {
		let response: Response;
		
		try {
			response = await fetch(url, fetchOptions);
		} catch (fetchError) {
			// Log the actual error for debugging
			console.error(`Fetch Error [${method} ${path}]:`, {
				url,
				error: fetchError,
				errorType: fetchError instanceof TypeError ? 'TypeError' : 'Unknown',
				errorMessage: fetchError instanceof Error ? fetchError.message : String(fetchError),
				errorStack: fetchError instanceof Error ? fetchError.stack : undefined
			});
			// Re-throw to be caught by outer catch block
			throw fetchError;
		}

		if (response.status === 401 && auth && state.refreshToken) {
			const refreshed = await authStore.refresh();
			if (refreshed) {
				const refreshedState = get(authStore);
				headers.set('Authorization', `Bearer ${refreshedState.accessToken}`);
				// Update headers in fetchOptions
				fetchOptions.headers = headers;
				response = await fetch(url, fetchOptions);
			} else {
				// Refresh failed, user needs to log in again
				// Don't throw error here, let it fall through to show 401 error
			}
		}

		if (!response.ok) {
			const errorBody = await response.json().catch(() => ({}));
			let errorMessage = errorBody.message ?? `Request failed with status ${response.status}`;
			
			// Make error messages more user-friendly
			if (response.status === 401) {
				errorMessage = 'Please log in to continue';
			} else if (response.status === 403) {
				errorMessage = 'You do not have permission to perform this action';
			} else if (response.status === 404) {
				errorMessage = 'Resource not found';
			} else if (response.status === 409) {
				errorMessage = errorBody.message || 'This action conflicts with existing data';
			} else if (response.status >= 500) {
				errorMessage = 'Server error. Please try again later';
			}
			
			console.error(`API Error [${method} ${path}]:`, {
				status: response.status,
				statusText: response.statusText,
				message: errorMessage,
				errors: errorBody.errors
			});
			throw new Error(errorMessage);
		}

		// Handle 204 No Content responses (common for DELETE requests)
		if (response.status === 204) {
			return undefined as T;
		}

		// For DELETE requests with 2xx status, check if response is empty before parsing
		if (method === 'DELETE' && response.status >= 200 && response.status < 300) {
			const contentLength = response.headers.get('content-length');
			// If content-length is 0, response is definitely empty
			if (contentLength === '0') {
				return undefined as T;
			}
			// If content-length is null/not set, it might be empty - let parseResponse handle it
		}

		return parseResponse<T>(response);
	} catch (error) {
		// Handle network errors (CORS, connection refused, etc.)
		if (error instanceof TypeError) {
			const errorMessage = error.message.toLowerCase();
			// Check for various network error types
			if (
				errorMessage.includes('fetch') ||
				errorMessage.includes('network') ||
				errorMessage.includes('failed') ||
				errorMessage.includes('cors') ||
				errorMessage.includes('refused')
			) {
			console.error(`Network Error [${method} ${path}]:`, {
				url,
					error: error.message,
					errorName: error.name,
					method,
					hasBody: !!body,
					headers: Object.fromEntries(headers.entries())
			});
				// More user-friendly error message
				throw new Error('Unable to connect to the server. Please check your connection and ensure the backend is running.');
		}
		}
		// Re-throw other errors as-is
		throw error;
	}
}

