export type RecipeReviews = {
	reviews: ReviewType[];
	stats: {
		averageRating: string | null;
		totalReviews: number;
	};
};

export type ReviewType = {
	review: {
		id: number;
		recipe_id: number;
		username: string;
		rating: number;
		content: string | null;
		created_at: Date;
		updated_at: Date;
	};
	response: {
		id: number;
		review_id: number;
		creator_username: string;
		content: string;
		created_at: Date;
	} | null;
};
