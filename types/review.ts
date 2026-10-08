/**
 * Shapes returned by `GET /recipes/:recipe_slug/reviews`.
 *
 * Timestamps arrive as ISO strings over JSON, not `Date` objects — format them
 * with `helper/formatDate` (it takes a `Date`, so wrap with `new Date(...)`).
 */
export type RecipeReview = {
	id: number;
	username: string;
	rating: number;
	content: string | null;
	created_at: string;
	updated_at: string;
	/**
	 * Whether this review is the signed-in user's.
	 *
	 * Computed server-side. The API deliberately returns no Clerk `user_id`, so
	 * the client cannot (and must not) compare ids to find its own review.
	 */
	is_own: boolean;
};

export type RecipeReviewResponse = {
	creator_username: string;
	content: string;
	created_at: string;
};

export type ReviewType = {
	review: RecipeReview;
	response: RecipeReviewResponse | null;
};

export type RecipeReviews = {
	reviews: ReviewType[];
	stats: {
		averageRating: number | null;
		totalReviews: number;
	};
	/** Whether the signed-in viewer owns the recipe and may reply to reviews. */
	viewer: {
		isCreator: boolean;
	};
};
