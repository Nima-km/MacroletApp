import { toApiError, apiErrorFrom } from "./errors";
import { RecipeData } from "@/types/recipe";
import { transformRecipesFromAPI } from "./tranformers";

export async function fetchFilteredRecipes({
	filters,
	title,
	token,
	page = 1,
}: {
	filters: Record<string, any>;
	title: string;
	token: string;
	page?: number;
}) {
	if (title.length < 3) return { data: [], pagination: null };

	const query = new URLSearchParams();
	if (title?.trim()) query.append("search", title.trim());
	query.append("page", String(page));
	query.append("limit", "20");

	Object.entries(filters).forEach(([k, v]) => {
		if (v !== undefined && v !== null) query.append(k, String(v));
	});

	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/recipes/search/?${query.toString()}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		},
	);

	const data = await response.json();

	if (!response.ok) throw apiErrorFrom(response.status, data);

	return {
		data: transformRecipesFromAPI(data.data), // data.data since response is now { data, pagination }
		pagination: data.pagination,
	};
}
export const fetchRecipeFromSlug = async (
	recipe_slug: string,
): Promise<RecipeData> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/recipes/${recipe_slug}`,
	);

	if (!res.ok) throw await toApiError(res);

	return res.json();
};
type AuthorType = {
	display_name: string;
	username: string;
	profilePic?: string;
};
export const fetchAuthorFromSlug = async (
	recipe_slug: string,
): Promise<{ author: AuthorType }> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/creator/${recipe_slug}`,
	);

	if (!res.ok) throw await toApiError(res);

	return res.json();
};
export const TESTBACKEND = async (token: string) => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/debug`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) throw await toApiError(res);
	//console.log("response", res);
	return res.json();
};
