import { toApiError } from "./errors";
import { FoodInsert } from "@/types/food";

export const postFood = async (food: FoodInsert, token: string) => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/food`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(food),
	});

	if (!res.ok) throw await toApiError(res);

	return res.json();
};
