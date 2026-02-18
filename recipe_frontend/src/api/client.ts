export type Ingredient = {
	name: string;
	quantity?: string;
	unit?: string;
};

export type Recipe = {
	id: string;
	title: string;
	description?: string;
	ingredients: Ingredient[];
	steps: string[];
	categories?: string[];
	tags?: string[];
	photoUrl?: string;
	authorUserId?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type RatingSummary = {
	recipeId: string;
	average: number;
	count: number;
};

const API_BASE_URL =
	// Remotion runs in the browser; use env if provided.
	(process.env.REMOTION_BACKEND_URL as string | undefined) ??
	(process.env.BACKEND_URL as string | undefined) ??
	"https://vscode-internal-35621-qa.qa01.cloud.kavia.ai:3001";

const DEFAULT_USER_ID = "demo-user";

/**
 * Build a URL with query parameters.
 */
const buildUrl = (path: string, params?: Record<string, string | undefined>) => {
	const url = new URL(path, API_BASE_URL);
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			if (v && v.trim().length > 0) {
				url.searchParams.set(k, v);
			}
		}
	}
	return url.toString();
};

const request = async <T,>(
	path: string,
	options?: RequestInit & { params?: Record<string, string | undefined> },
): Promise<T> => {
	const url = buildUrl(path, options?.params);
	const res = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			"X-User-Id": DEFAULT_USER_ID,
			...(options?.headers ?? {}),
		},
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
	}
	return (await res.json()) as T;
};

// PUBLIC_INTERFACE
export const RecipesApi = {
	/** List recipes with optional query params. */
	list: (params?: { q?: string; category?: string; tag?: string }) =>
		request<Recipe[]>("/api/recipes", { params }),

	/** Get a recipe by id. */
	get: (id: string) => request<Recipe>(`/api/recipes/${id}`),

	/** Fetch rating summary for a recipe. */
	ratingSummary: (id: string) => request<RatingSummary>(`/api/recipes/${id}/rating`),
};
