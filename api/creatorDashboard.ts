import { toApiError } from "./errors";
import {
	CreatorOverview,
	CreatorPayout,
	DashboardRecipe,
	PaginatedDashboardRecipes,
	RecipeAnalytics,
	TopPerformingRecipes,
} from "@/types/dashboard";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchCreatorOverview = async (
	token: string,
): Promise<CreatorOverview> => {
	const res = await fetch(`${API_URL}/dashboard/overview`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const fetchCreatorRecipes = async (
	token: string,
	page = 1,
	limit = 20,
): Promise<PaginatedDashboardRecipes> => {
	const params = new URLSearchParams();
	params.append("page", String(page));
	params.append("limit", String(limit));

	const res = await fetch(
		`${API_URL}/dashboard/recipes?${params.toString()}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		},
	);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const fetchRecipeAnalytics = async (
	recipe_slug: string,
	token: string,
): Promise<RecipeAnalytics> => {
	const res = await fetch(
		`${API_URL}/dashboard/recipes/${recipe_slug}/analytics`,
		{
			headers: { Authorization: `Bearer ${token}` },
		},
	);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const fetchPayoutHistory = async (
	token: string,
): Promise<CreatorPayout[]> => {
	const res = await fetch(`${API_URL}/dashboard/payouts`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const fetchTopPerformingRecipes = async (
	token: string,
): Promise<TopPerformingRecipes> => {
	const res = await fetch(`${API_URL}/dashboard/recipes/top`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const archiveRecipe = async (
	recipe_slug: string,
	token: string,
): Promise<DashboardRecipe> => {
	const res = await fetch(
		`${API_URL}/dashboard/recipes/${recipe_slug}/archive`,
		{
			method: "PATCH",
			headers: { Authorization: `Bearer ${token}` },
		},
	);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

export const publishRecipe = async (
	recipe_slug: string,
	token: string,
): Promise<DashboardRecipe> => {
	const res = await fetch(
		`${API_URL}/dashboard/recipes/${recipe_slug}/publish`,
		{
			method: "PATCH",
			headers: { Authorization: `Bearer ${token}` },
		},
	);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};
/*
export const deleteRecipe = async (recipe_slug: string, token: string) => {
	const res = await fetch(`${API_URL}/dashboard/recipes/${recipe_slug}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
	return res.json();
};
*/
