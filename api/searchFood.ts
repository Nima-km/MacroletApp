import { toApiError } from "./errors";
import { FoodInsert } from "@/types/food";

export const fetchSearchFood = async (
	query: string,
	token: string,
): Promise<FoodInsert[]> => {
	console.log("searching for food", query);
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/food/${encodeURIComponent(query)}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!res.ok) throw await toApiError(res);

	return res.json();
};
