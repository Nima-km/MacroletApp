import { toApiError } from "./errors";

/**
 * Blocking.
 *
 * The server enforces the block - blocked creators disappear from search, discovery and
 * their own profile - so the client's job is only to record and undo it.
 */

export type BlockedAccount = {
	username: string;
	display_name: string;
	created_at: string;
};

const authed = (token: string) => ({
	Authorization: `Bearer ${token}`,
	"Content-Type": "application/json",
});

export const blockUser = async (
	token: string,
	username: string,
): Promise<void> => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/blocks`, {
		method: "POST",
		headers: authed(token),
		body: JSON.stringify({ username }),
	});
	if (!res.ok) throw await toApiError(res);
};

export const unblockUser = async (
	token: string,
	username: string,
): Promise<void> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/blocks/${encodeURIComponent(username)}`,
		{ method: "DELETE", headers: authed(token) },
	);
	if (!res.ok) throw await toApiError(res);
};

export const fetchBlockedAccounts = async (
	token: string,
): Promise<BlockedAccount[]> => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/blocks`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw await toApiError(res);
	const body = (await res.json()) as { blocks?: BlockedAccount[] };
	return body.blocks ?? [];
};
