import { toApiError } from "./errors";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Follow relations are addressed by **username**, matching the backend: the
 * username is a person's public key, and neither internal ids nor Clerk ids
 * appear in a path or a response body.
 */

export const followCreator = async (username: string, token: string) => {
	const res = await fetch(
		`${API_URL}/follow/${encodeURIComponent(username)}`,
		{
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
		},
	);
	if (!res.ok) throw await toApiError(res);
	return res.json().catch(() => null);
};

export const unfollowCreator = async (username: string, token: string) => {
	const res = await fetch(
		`${API_URL}/follow/${encodeURIComponent(username)}`,
		{
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		},
	);
	if (!res.ok) throw await toApiError(res);
	return res.json().catch(() => null);
};

export const fetchFollowerCount = async (
	username: string,
): Promise<{ count: number }> => {
	const res = await fetch(
		`${API_URL}/follow/${encodeURIComponent(username)}/followers`,
	);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};
