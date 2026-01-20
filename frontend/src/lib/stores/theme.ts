import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('dark');

	return {
		subscribe,
		initialize: () => {
			if (!browser) return;

			// Check localStorage first
			const stored = localStorage.getItem('theme') as Theme | null;
			if (stored === 'light' || stored === 'dark') {
				set(stored);
				applyTheme(stored);
				return;
			}

			// Check system preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const theme = prefersDark ? 'dark' : 'light';
			set(theme);
			applyTheme(theme);
		},
		toggle: () => {
			update(current => {
				const newTheme = current === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					applyTheme(newTheme);
				}
				return newTheme;
			});
		},
		setTheme: (theme: Theme) => {
			set(theme);
			if (browser) {
				localStorage.setItem('theme', theme);
				applyTheme(theme);
			}
		}
	};
}

function applyTheme(theme: Theme) {
	if (!browser) return;
	
	const root = document.documentElement;
	if (theme === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}
}

export const themeStore = createThemeStore();
