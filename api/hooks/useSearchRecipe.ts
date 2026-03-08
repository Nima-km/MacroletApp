import { useAuth } from "@clerk/clerk-expo";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchFilteredRecipes } from "../searchRecipe";

export function useFilteredRecipes(filters: any, title: string) {
    const { getToken, isSignedIn } = useAuth();
    console.log("useFilteredRecipe gets called", title, filters, isSignedIn);
    return useQuery({
        queryKey: ["recipes", filters, title],
        enabled: isSignedIn, // don't run if not signed in
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
        queryFn: async () => {
            const token = await getToken();

            if (!token) throw new Error("No auth token");

            return fetchFilteredRecipes({
                filters,
                title,
                token,
            });
        },
    });
}
