export type CreatorOverview = {
	totalRecipes: number;
	totalLogs: number;
	totalImpressions: number;
	pendingBalanceCents: number;
};

export type DashboardRecipe = {
	recipeData: {
		recipe_slug: string | null;
		servings_yield: number;
		prep_time: number;
		cook_time: number;
		bannerImage: string | null;
	};
	foodData: {
		name: string;
		calories: number;
		protein: number;
		carbs: number;
		fiber: number;
		fat: number;
	};
	recipeStats: {
		status: string;
		created_at: string;
		updated_at: string;
		totalLogs: number;
		totalImpressions: number;
	};
};
export type PaginatedDashboardRecipes = {
	data: DashboardRecipe[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
};

export type RecipeAnalytics = {
	monthlyLogs: { month: string; count: number }[];
	monthlyImpressions: { month: string; count: number }[];
};

export type CreatorPayout = {
	id: number;
	creator_id: number;
	period_id: number;
	gross_amount_cents: number;
	rollover_cents: number;
	total_amount_cents: number;
	stripe_transfer_id: string | null;
	status: string;
	created_at: string;
};

export type TopPerformingRecipes = {
	byLogs: {
		id: number;
		name: string;
		recipe_slug: string | null;
		bannerImage: string | null;
		totalLogs: number;
	}[];
	byImpressions: {
		id: number;
		name: string;
		recipe_slug: string | null;
		bannerImage: string | null;
		totalImpressions: number;
	}[];
};
