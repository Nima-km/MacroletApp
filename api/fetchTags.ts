import { toApiError } from "./errors";
export const fetchApprovedTags = async (): Promise<string[]> => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tag`);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};
