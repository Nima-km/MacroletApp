import Toast from "react-native-toast-message";

/**
 * An API failure that keeps the HTTP status, so callers (and the global
 * React Query handlers) can tell "not signed in" / "no subscription" apart
 * from ordinary failures.
 */
export class ApiError extends Error {
	readonly status: number;
	/**
	 * Per-field messages from a validation failure. The API returns
	 * `{ error: "Validation failed", issues: { username: ["..."] } }`, and the
	 * useful part is `issues` - without it a form can only say "it failed".
	 */
	readonly issues?: Record<string, string[]>;

	constructor(
		message: string,
		status: number,
		issues?: Record<string, string[]>,
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.issues = issues;
	}
}

export const isApiError = (error: unknown): error is ApiError =>
	error instanceof ApiError;

/** Structurally compatible with `fetch`'s Response; avoids depending on DOM types. */
type ErrorResponse = { status: number; json: () => Promise<any> };

function defaultMessageFor(status: number): string {
	if (status === 401) return "You need to be signed in to do that.";
	if (status === 403) return "This feature needs a Premium subscription.";
	if (status === 404) return "We couldn't find that.";
	if (status >= 500) return "Something went wrong on our end. Try again.";
	return "Something went wrong.";
}

function pickMessage(body: any): string | undefined {
	const raw = body?.error ?? body?.message;
	if (!raw) return undefined;
	if (typeof raw === "string") return raw;
	// Some handlers serialise the error object itself (e.g. /creator/credit).
	try {
		return JSON.stringify(raw);
	} catch {
		return undefined;
	}
}

/** Field-level messages, when the server rejected specific fields. */
function pickIssues(body: any): Record<string, string[]> | undefined {
	const issues = body?.issues;
	if (!issues || typeof issues !== "object") return undefined;

	const cleaned: Record<string, string[]> = {};
	for (const [field, messages] of Object.entries(issues)) {
		if (Array.isArray(messages) && messages.length > 0) {
			cleaned[field] = messages.map(String);
		}
	}
	return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

/** Build an ApiError from a response whose body has not been read yet. */
export async function toApiError(res: ErrorResponse): Promise<ApiError> {
	let body: any;
	try {
		body = await res.json();
	} catch {
		// Non-JSON body (HTML error page, empty 502, aborted request...).
	}
	return new ApiError(
		pickMessage(body) ?? defaultMessageFor(res.status),
		res.status,
		pickIssues(body),
	);
}

/** Build an ApiError when the body was already parsed (`res.json()` pattern). */
export function apiErrorFrom(status: number, body?: any): ApiError {
	return new ApiError(
		pickMessage(body) ?? defaultMessageFor(status),
		status,
		pickIssues(body),
	);
}

/**
 * The message the server attached to one form field, if any. Lets a screen show
 * "That username is already taken" under the username input instead of a
 * generic failure banner.
 */
export function fieldErrorFor(
	error: unknown,
	field: string,
): string | undefined {
	if (!isApiError(error)) return undefined;
	return error.issues?.[field]?.[0];
}

/**
 * Thrown when a hook has no Clerk session. Shape-compatible with a 401 so the
 * same "sign in" toast covers requests we never get to send.
 */
export const notSignedIn = (): ApiError =>
	new ApiError(defaultMessageFor(401), 401);

/** The message a user should see for any failure. */
export function messageForApiError(error: unknown): string {
	if (isApiError(error)) {
		if (error.status === 401 || error.status === 403) {
			return defaultMessageFor(error.status);
		}
		return error.message || defaultMessageFor(error.status);
	}
	if (error instanceof Error && error.message) {
		// fetch() rejects with a TypeError when the host is unreachable.
		if (error instanceof TypeError) {
			return "Can't reach the server. Check your connection.";
		}
		return error.message;
	}
	return "Something went wrong.";
}

export function showApiErrorToast(error: unknown): void {
	Toast.show({
		type: "warning",
		text1: messageForApiError(error),
		visibilityTime: 4000,
	});
}

/** Global handler for failed mutations - every failure is worth surfacing. */
export function onMutationError(error: unknown): void {
	showApiErrorToast(error);
}

/**
 * Global handler for failed queries. Only auth/premium failures toast here;
 * transient network errors would otherwise fire on every screen mount.
 */
export function onQueryError(error: unknown): void {
	if (isApiError(error) && (error.status === 401 || error.status === 403)) {
		showApiErrorToast(error);
	}
}
