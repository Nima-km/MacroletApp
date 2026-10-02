import { RecipeBook, RecipeBookItem } from "@/types/recipe";
import { RecipeCardData } from "./fetchDiscoverFeed";

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
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
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
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
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
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
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
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
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
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
	return res.json();
};

export const fetchRecipesFromRecipeBook = async (
	recipeBook_slug: string,
	token: string,
): Promise<RecipeCardData[]> => {
	const res = await fetch(`${API_URL}/recipebooks/${recipeBook_slug}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
	return res.json();
};
