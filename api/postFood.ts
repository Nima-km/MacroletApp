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

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}

	return res.json();
};
