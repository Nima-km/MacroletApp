/**
 * What "finished" means in the create-recipe flow.
 *
 * These rules already existed, but only as a chain of `if`s around a `console.log`:
 * pressing Next with a short description did nothing on screen, so the flow looked
 * broken rather than incomplete. Keeping the rules here - pure, no components, no
 * router - lets the screens say *which* requirement is unmet instead of failing mute.
 */

export type Requirement = {
	id: string;
	/** Shown to the user as the reason they cannot continue. */
	label: string;
	met: boolean;
};

/** The minimum the description must reach (the rule is `> 10` characters). */
export const MIN_DESCRIPTION_LENGTH = 11;
export const MIN_NAME_LENGTH = 4;
export const MIN_TAGS = 3;

type DraftLike = {
	foodData?: { name?: string | null };
	recipeData?: {
		description?: string | null;
		servings_yield?: number | null;
		directions?: unknown[] | null;
		tags?: unknown[] | null;
	};
	ingredientItemsData?: unknown[];
};

function lengthOf(value: string | null | undefined) {
	return (value ?? "").trim().length;
}

/** Step 1: name, description, tags. */
export function overviewRequirements(draft: DraftLike): Requirement[] {
	const name = lengthOf(draft.foodData?.name);
	const description = lengthOf(draft.recipeData?.description);
	const tags = draft.recipeData?.tags?.length ?? 0;

	return [
		{
			id: "name",
			label: `Recipe name must be at least ${MIN_NAME_LENGTH} characters`,
			met: name >= MIN_NAME_LENGTH,
		},
		{
			id: "description",
			label: `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`,
			met: description >= MIN_DESCRIPTION_LENGTH,
		},
		{
			id: "tags",
			label: `Add at least ${MIN_TAGS} tags`,
			met: tags >= MIN_TAGS,
		},
	];
}

/** The last step before preview: everything that must exist by then. */
export function directionsRequirements(draft: DraftLike): Requirement[] {
	const ingredients = draft.ingredientItemsData?.length ?? 0;
	const servings = draft.recipeData?.servings_yield ?? 0;
	const directions = draft.recipeData?.directions?.length ?? 0;

	return [
		...overviewRequirements(draft),
		{
			id: "ingredients",
			label: "Add at least one ingredient",
			met: ingredients > 0,
		},
		{
			id: "servings",
			label: "Set how many servings the recipe makes",
			met: servings >= 1,
		},
		{
			id: "directions",
			label: "Add at least one direction",
			met: directions > 0,
		},
	];
}

/** The first thing standing in the way, for a single, specific message. */
export function firstUnmet(
	requirements: Requirement[],
): Requirement | undefined {
	return requirements.find((requirement) => !requirement.met);
}

export function allMet(requirements: Requirement[]) {
	return requirements.every((requirement) => requirement.met);
}
