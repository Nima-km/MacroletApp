import { toApiError } from "./errors";
import { RecipeCardData } from "./fetchDiscoverFeed";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type AuthorType = {
	username: string;
	display_name: string;
	about: string;
};
type RecipeBookType = {
	name: string;
	/** The public key for the book; returned by the API, used to open it. */
	recipeBook_slug: string;
	picture?: string;
	recipes: RecipeCardData[];
};
type CreatorProfileType = {
	author: AuthorType;
	/** Whether the signed-in viewer already follows them. Computed server-side. */
	is_following: boolean;
	stats: {
		recipes: number;
		followers: number;
		/** `null` until the creator has been reviewed at least once. */
		avg_rating: number | null;
	};
	recipeBooks: RecipeBookType[];
};
type CreatorRecipesType = {
	/** An array: the screen does `pages.flatMap((page) => page.recipes)`. */
	recipes: RecipeCardData[];
	pagination: Pagination;
};
export type Pagination = {
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
	if (!res.ok) throw await toApiError(res);
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
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

// ---------------------------------------------------------------------------
// Creator profile and payout onboarding
//
// Publishing and earning never require a Stripe account; `payout_state` decides
// whether money can actually be sent (docs/PAYOUT_MODEL.md D7).
// ---------------------------------------------------------------------------

export type PayoutState =
	| "pending"
	| "onboarded"
	| "payouts_enabled"
	| "restricted";

export type CreatorStatus = {
	creator: {
		username: string;
		display_name: string;
		about: string | null;
		is_active: boolean;
		payout_state: PayoutState;
		pending_balance_cents: number;
		unpayable_cents: number;
		has_stripe_account: boolean;
	} | null;
	profile_complete: boolean;
	payouts_ready: boolean;
	payout_state: PayoutState | null;
};

export type CreatorProfileInput = {
	username: string;
	display_name: string;
	about?: string;
};

const authed = (token: string) => ({
	Authorization: `Bearer ${token}`,
	"Content-Type": "application/json",
});

/** Single source of truth for "where is this user in the creator flow". */
export const fetchCreatorStatus = async (
	token: string,
): Promise<CreatorStatus> => {
	const res = await fetch(`${API_URL}/creator/onboard/status`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

/** Create or update the creator profile. Publishes immediately. */
export const saveCreatorProfile = async (
	token: string,
	profile: CreatorProfileInput,
): Promise<{
	creator: NonNullable<CreatorStatus["creator"]>;
	created: boolean;
}> => {
	const res = await fetch(`${API_URL}/creator/onboard`, {
		method: "POST",
		headers: authed(token),
		body: JSON.stringify({
			username: profile.username,
			display_name: profile.display_name,
			// Omit rather than send "": the API treats absence as "no bio".
			about: profile.about?.trim() ? profile.about.trim() : undefined,
		}),
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

/** Begin or resume Stripe payout onboarding; returns the hosted URL. */
export const startPayoutSetup = async (
	token: string,
): Promise<{ onboarding_url: string }> => {
	const res = await fetch(`${API_URL}/creator/payouts/setup`, {
		method: "POST",
		headers: authed(token),
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
};
