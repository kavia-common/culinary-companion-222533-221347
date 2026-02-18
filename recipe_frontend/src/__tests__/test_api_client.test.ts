import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("RecipesApi client", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.unstubAllGlobals();
	});

	it("list() calls /api/recipes with query params and sets X-User-Id header", async () => {
		vi.stubEnv("REMOTION_BACKEND_URL", "https://example.test");

		const fetchMock = vi.fn(async () => {
			return {
				ok: true,
				status: 200,
				statusText: "OK",
				json: async () => [],
			} as any;
		});
		globalThis.fetch = fetchMock as any;

		const { RecipesApi } = await import("../api/client");

		await RecipesApi.list({ q: "nachos", tag: "retro" });

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];

		expect(url).toBe("https://example.test/api/recipes?q=nachos&tag=retro");
		expect(init.headers["Content-Type"]).toBe("application/json");
		expect(init.headers["X-User-Id"]).toBe("demo-user");
	});

	it("get() throws a helpful error when response is not ok", async () => {
		vi.stubEnv("REMOTION_BACKEND_URL", "https://example.test");

		const fetchMock = vi.fn(async () => {
			return {
				ok: false,
				status: 404,
				statusText: "Not Found",
				text: async () => "missing",
			} as any;
		});
		globalThis.fetch = fetchMock as any;

		const { RecipesApi } = await import("../api/client");

		await expect(RecipesApi.get("nope")).rejects.toThrow(
			"API 404 Not Found: missing",
		);
	});
});
