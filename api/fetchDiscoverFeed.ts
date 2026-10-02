import { toApiError } from "./errors";
import { FoodInsert } from "@/types/food";
import { RecipeInsert } from "@/types/recipe";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type DiscoverRecipe = {
	recipe_id: number;
	name: string;
	recipe_slug: string;
	bannerImage: string | null;
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	fiber: number;
	servings_yield: number;
	prep_time: number;
	cook_time: number;
	avg_rating: number;
	score?: number;
	creator_id?: number | null;
};
export type RecipeCardData = {
	recipeData: RecipeInsert;
	foodData: FoodInsert;
};

export type DiscoverSection = {
	title: string;
	type: "tag" | "following" | "new";
	recipes: RecipeCardData[];
};
export type DiscoverType = {
	sections: DiscoverSection[];
	follows: { username: string; display_name: string }[];
};

function toRecipeCardData(item: DiscoverRecipe): RecipeCardData {
	return {
		recipeData: {
			id: item.recipe_id,
			recipe_slug: item.recipe_slug,
			bannerImage: item.bannerImage,
			servings_yield: item.servings_yield,
			prep_time: item.prep_time,
			cook_time: item.cook_time,
		},
		foodData: {
			name: item.name,
			protein: item.protein,
			fat: item.fat,
			carbs: item.carbs,
			fiber: item.fiber,
		},
	};
}

export const fetchDiscoverFeed = async (
	mandatory_tags: string[],
	optional_tags: string[],
	token: string,
): Promise<DiscoverType> => {
	const params = new URLSearchParams();
	if (mandatory_tags.length)
		params.append("mandatory", mandatory_tags.join(","));
	if (optional_tags.length)
		params.append("optional", optional_tags.join(","));
	const res = await fetch(`${API_URL}/discover?${params.toString()}`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) throw await toApiError(res);

	const data: {
		sections: { title: string; type: string; recipes: DiscoverRecipe[] }[];
		follows: { username: string; display_name: string }[];
	} = await res.json();
	console.log("data fetched is", data);
	// Transform each section's recipes into RecipeCardData
	const result = data.sections.map((section) => ({
		title: section.title,
		type: section.type as DiscoverSection["type"],
		recipes: section.recipes.map(toRecipeCardData),
	}));
	return { sections: result, follows: data.follows };
};
