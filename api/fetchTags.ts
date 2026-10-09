import { toApiError } from "./errors";

/**
 * Approved tags, as `tag.name` slugs (`high-protein`).
 *
 * These slugs are the wire format: `getDiscoverFeed` matches the `mandatory` and
 * `optional` query params against `tag.name` exactly, so **always send the slug**
 * and only ever use `tagLabel` for display. Sending the pretty label ("High
 * protein") resolves to nothing, and the tag's feed section disappears with no
 * error - which is the trap a hardcoded chip list walks straight into.
 */
export const fetchApprovedTags = async (): Promise<string[]> => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tag`);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};

/**
 * Spelling the slug cannot derive, because these are hyphenated compounds or
 * proper nouns. Everything else falls back to de-hyphenating and capitalising.
 */
const TAG_LABELS: Record<string, string> = {
	"high-protein": "High protein",
	"low-calorie": "Low calorie",
	"low-carb": "Low carb",
	"high-calorie": "High calorie",
	"meal-prep": "Meal prep",
	"gluten-free": "Gluten-free",
	"dairy-free": "Dairy-free",
	"nut-free": "Nut-free",
	"middle-eastern": "Middle Eastern",
	"red-meat": "Red meat",
	vegan: "Vegan",
	keto: "Keto",
};

/** Display label for a tag slug. Never send this back to the API. */
export const tagLabel = (name: string): string =>
	TAG_LABELS[name] ??
	name
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

export type TagSupply = { name: string; recipe_count: number };

/**
 * Approved tags with how many published recipes carry them, busiest first.
 *
 * Supply is what stops the UI offering a dead end. A tag with no recipes has no
 * cached feed section, so choosing it produces an empty screen with no
 * explanation - and because tag names are free to change, that can happen to any
 * tag at any time.
 */
export const fetchPopularTags = async (): Promise<TagSupply[]> => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tag/popular`);
	if (!res.ok) throw await toApiError(res);
	return res.json();
};
