import { ReviewType } from "@/types/review";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchRecipeReviews = async (
	recipe_slug: string,
	token: string,
): Promise<ReviewType> => {
	const res = await fetch(`${API_URL}/recipes/${recipe_slug}/reviews`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
	return res.json();
};

export const postReview = async (
	recipe_slug: string,
	body: { rating: number; content?: string },
	token: string,
) => {
	const res = await fetch(`${API_URL}/recipes/${recipe_slug}/reviews`, {
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

/*
export const patchReview = async (
	recipe_slug: string,
	body: { rating?: number; content?: string },
	token: string,
) => {
	const res = await fetch(`${API_URL}/recipes/${recipe_slug}/reviews`, {
		method: "PATCH",
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
*/

export const postCreatorResponse = async (
	review_id: number,
	content: string,
	token: string,
) => {
	const res = await fetch(
		`${API_URL}/recipes/reviews/${review_id}/response`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ content }),
		},
	);
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error);
	}
	return res.json();
};

export const postReport = async (
	recipe_slug: string,
	body: { reason: string; details?: string | null },
	token: string,
) => {
	const res = await fetch(`${API_URL}/recipes/${recipe_slug}/report`, {
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
