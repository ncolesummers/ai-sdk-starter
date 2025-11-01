import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock environment variables
beforeEach(() => {
	vi.stubEnv("NODE_ENV", "test");
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
	useRouter: vi.fn(() => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		pathname: "/",
		query: {},
		asPath: "/",
	})),
	usePathname: vi.fn(() => "/"),
	useSearchParams: vi.fn(() => new URLSearchParams()),
	useParams: vi.fn(() => ({})),
	redirect: vi.fn(),
	notFound: vi.fn(),
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
	headers: vi.fn(() => new Headers()),
	cookies: vi.fn(() => ({
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
	})),
}));

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeEach(() => {
	console.error = (...args: unknown[]) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("Warning: ReactDOM.render")
		) {
			return;
		}
		originalError.call(console, ...args);
	};
});