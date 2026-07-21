import { insertFoodList } from "@/db/queries/food";
import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchFood } from "../searchFood";

export const useSearchFood = (query: string) => {
	const { getToken } = useAuth();

	return useQuery({
		queryKey: ["food", "search", query],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			try {
				const apiResult = await fetchSearchFood(query, token);
				const processed = apiResult.map((item) => {
					return { ...item, id: undefined };
				});
				if (processed) {
					console.log("Found via API:", processed);
					const savedResult = await insertFoodList(processed);
					console.log("Found via API RESULT:", savedResult);
					return savedResult;
				} else {
					throw new Error("No results from API");
				}
			} catch (apiError) {
				console.warn("API lookup and cache save failed:", apiError);
				throw apiError; // Throw to trigger error state instead of undefined
			}
		},
		enabled: !!query.trim(),
		staleTime: 1000 * 60 * 5,
		retry: false,
	});
};
