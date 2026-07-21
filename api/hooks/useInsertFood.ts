import { FoodInsert } from "@/types/food";
import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";
import { postFood } from "../postFood";

export const useInsertFood = () => {
	const { getToken } = useAuth();

	return useMutation({
		mutationFn: async (food: FoodInsert) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return postFood(food, token);
		},
	});
};
