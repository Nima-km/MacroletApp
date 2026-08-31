import { RecipeCardData } from "./fetchDiscoverFeed";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type AuthorType = {
	username: string;
	display_name: string;
	about: string;
};
type RecipeBookType = {
	name: string;
	picture?: string;
	recipes: RecipeCardData[];
};
type CreatorProfileType = {
	author: AuthorType;
	recipeBooks: RecipeBookType[];
};
type CreatorRecipesType = {
	recipes: RecipeCardData;
	pagination: Pagination;
};
type Pagination = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
};

export const fetchCreatorProfile = async (
	username: string,
	token: string,
): Promise<CreatorProfileType> => {
	const res = await fetch(`${API_URL}/recipes/creator/${username}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
	return res.json();
};

export const fetchCreatorRecipes = async (
	username: string,
	token: string,
	page = 1,
	limit = 20,
): Promise<CreatorRecipesType> => {
	const params = new URLSearchParams();
	params.append("page", String(page));
	params.append("limit", String(limit));

	const res = await fetch(
		`${API_URL}/recipes/creator/allrecipes/${username}?${params.toString()}`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
	return res.json();
};
