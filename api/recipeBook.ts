import { toApiError } from "./errors";
import { RecipeBook, RecipeBookItem } from "@/types/recipe";
import { RecipeCardData } from "./fetchDiscoverFeed";
import type { Pagination } from "./creator";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const postRecipeBook = async (
	body: { name: string; pictures?: string[] },
	token: string,
): Promise<RecipeBook> => {
	const res = await fetch(`${API_URL}/recipebooks`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const deleteRecipeBookApi = async (
	recipeBook_id: number,
	token: string,
): Promise<RecipeBook> => {
	const res = await fetch(`${API_URL}/recipebooks/${recipeBook_id}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const postRecipeToBook = async (
	recipeBook_id: number,
	recipe_slug: string,
	token: string,
): Promise<RecipeBookItem> => {
	const res = await fetch(`${API_URL}/recipebooks/${recipeBook_id}/recipes`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ recipe_slug }),
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const deleteRecipeFromBook = async (
	recipeBook_id: number,
	recipe_slug: string,
	token: string,
): Promise<RecipeBookItem> => {
	const res = await fetch(
		`${API_URL}/recipebooks/${recipeBook_id}/recipes/${recipe_slug}`,
		{
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		},
	);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export type RecipeBookSummary = {
	recipeBook_slug: string;
	bookName: string;
	pictures: string[] | null;
};

export const fetchCreatorRecipeBooks = async (
	username: string,
	token: string,
): Promise<RecipeBookSummary[]> => {
	const res = await fetch(`${API_URL}/recipebooks/creator/${username}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const fetchRecipesFromRecipeBook = async (
	recipeBook_slug: string,
	token: string,
	page = 1,
	limit = 20,
): Promise<{ recipes: RecipeCardData[]; pagination: Pagination }> => {
	const params = new URLSearchParams();
	params.append("page", String(page));
	params.append("limit", String(limit));

	// Two segments, so it cannot be swallowed by `GET /recipebooks/:username`
	// (which is one segment and was what the old single-segment call hit).
	const res = await fetch(
		`${API_URL}/recipebooks/${recipeBook_slug}/recipes?${params.toString()}`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};
