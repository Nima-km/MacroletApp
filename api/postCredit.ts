import { toApiError } from "./errors";
export const postCredit = async (
	recipe_slug: string,
	token: string,
): Promise<void> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/creator/credit`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ recipe_slug }),
		},
	);

	if (!res.ok) throw await toApiError(res);
};
