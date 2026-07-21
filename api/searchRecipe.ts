import { RecipeData } from "@/types/recipe";
import { transformRecipesFromAPI } from "./tranformers";

export async function fetchFilteredRecipes({
	filters,
	title,
	token,
}: {
	filters: Record<string, any>;
	title: string;
	token: string;
}) {
	console.log("search recipe is fetching", filters, title);
	if (title.length < 3) {
		return [];
	}
	const query = new URLSearchParams();
	if (title?.trim()) {
		query.append("search", title.trim());
	}

	Object.entries(filters).forEach(([k, v]) => {
		if (v !== undefined && v !== null) {
			query.append(k, String(v));
		}
	});

	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/recipes/search/?${query.toString()}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	const data = await response.json();
	//console.log("test recieve searchRecipe", data.error, response.ok);

	if (!response.ok) {
		const err = data.error;
		throw new Error(err);
	}
	console.log("data from fetchfilteredrecips", data);
	return transformRecipesFromAPI(data);
}
export const fetchRecipeFromSlug = async (
	recipe_slug: string,
): Promise<RecipeData> => {
	const res = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/recipes/${recipe_slug}`,
	);

	if (!res.ok) throw new Error(`Failed to fetch recipe: ${res.status}`);

	return res.json();
};
export const TESTBACKEND = async (token: string) => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/debug`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) throw new Error(`FAILED TO CONNECT TO SERVER: ${res.status}`);
	//console.log("response", res);
	return res.json();
};
