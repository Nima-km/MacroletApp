import { apiErrorFrom } from "./errors";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/** One account in the Discover search's Accounts tab. */
export type CreatorSearchItem = {
	/**
	 * The public key — accounts are addressed by username everywhere. The API
	 * deliberately returns no numeric id, so none is available here.
	 */
	username: string;
	display_name: string;
	about: string | null;
	followers: number;
	is_following: boolean;
	/**
	 * Recipe thumbnails for the result card.
	 *
	 * Always empty today: there is no image pipeline yet (no upload endpoint, no
	 * storage, and no image column on `recipe`). The field is already part of the
	 * API contract so the card can render its strip once images exist — see
	 * `Macrolet-Express/docs/IMAGE_PIPELINE.md`.
	 */
	thumbnails: string[];
};

export type Pagination = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
};

export type CreatorSearchPage = {
	data: CreatorSearchItem[];
	pagination: Pagination | null;
};

/** Same 3-character threshold the recipe search uses, so both tabs agree. */
export const MIN_SEARCH_LENGTH = 3;

export async function fetchCreatorSearch({
	query,
	token,
	page = 1,
}: {
	query: string;
	token: string;
	page?: number;
}): Promise<CreatorSearchPage> {
	if (query.trim().length < MIN_SEARCH_LENGTH) {
		return { data: [], pagination: null };
	}

	const params = new URLSearchParams();
	params.append("q", query.trim());
	params.append("page", String(page));
	params.append("limit", "20");

	const res = await fetch(
		`${API_URL}/creator/search?${params.toString()}`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);

	const body = await res.json();
	if (!res.ok) throw apiErrorFrom(res.status, body);

	return {
		data: body.data ?? [],
		pagination: body.pagination ?? null,
	};
}
