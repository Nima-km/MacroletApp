import { notSignedIn } from "../errors";
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
			if (!token) throw notSignedIn();
			// Searching is read-only: a result is a candidate, not something the user
			// has saved. The row is written when they tap it (see `FindFood`), which is
			// what keeps the local library equal to "foods I chose".
			const apiResult = await fetchSearchFood(query, token);
			if (!apiResult) throw new Error("No results from API");
			// The id here is the server's, not a local row id - `foodItem: null` marks
			// these as unsaved in `FindFood`, which is what stops the two being confused.
			return apiResult;
		},
		enabled: !!query.trim(),
		staleTime: 1000 * 60 * 5,
		retry: false,
	});
};
