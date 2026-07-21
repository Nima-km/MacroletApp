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

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}

	return res.json();
};
