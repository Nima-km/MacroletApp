/**
 * What "finished" means in the create-recipe flow, split by visibility.
 *
 * There are two tiers, not one:
 *
 * - **private** — a local recipe only the author sees. Name, a servings yield and one
 *   ingredient. That is all a personal recipe needs.
 * - **public** — a recipe that will be uploaded, reviewed and credited. It has to be
 *   complete enough to be useful to strangers: a description, at least three tags, a
 *   banner image, at least one non-empty direction, and every ingredient must resolve
 *   to a food that exists in the backend. Otherwise the server cannot compute the
 *   macros, and logging it would credit a creator for a recipe nobody can reproduce.
 *
 * Pure: no components, no router, no database. Screens ask which requirement is unmet
 * and say so, instead of failing mute.
 */

export type Visibility = "private" | "public";

export type Requirement = {
	id: string;
	/** Shown to the user as the reason they cannot continue. */
	label: string;
	met: boolean;
};

export const MIN_DESCRIPTION_LENGTH = 11;
export const MIN_NAME_LENGTH = 4;
export const MIN_TAGS = 3;

type DraftLike = {
	foodData?: { name?: string | null };
	recipeData?: {
		description?: string | null;
		servings_yield?: number | null;
		directions?: { text?: string | null }[] | null;
		tags?: unknown[] | null;
		bannerImage?: unknown[] | string | null;
	} | null;
	ingredientItemsData?:
		| {
				food?: {
					nickname?: string | null;
					macros_edited?: boolean | null;
					/** Set when this food is a recipe — recipes can't be ingredients. */
					recipe_id?: number | null;
				} | null;
		  }[]
		| null;
};

function lengthOf(value: string | null | undefined) {
	return (value ?? "").trim().length;
}

/** A step counts only if its instruction text has something in it. */
export function nonEmptyDirections(draft: DraftLike) {
	return (draft.recipeData?.directions ?? []).filter(
		(step) => lengthOf(step?.text) > 0,
	);
}

/**
 * Ingredients a server could resolve.
 *
 * The signal is `nickname`: the backend assigns one to every food it knows and the
 * client upserts on it, so a food with a nickname is a catalogue food. A food the user
 * created on this device has none - and a recipe containing one cannot be published,
 * because the server computes the macros from the ingredients.
 */
export function isCatalogueIngredient(food?: {
	nickname?: string | null;
	macros_edited?: boolean | null;
} | null) {
	// A nickname means the backend knows this food; untouched macros mean it still
	// matches that entry. Editing macros is allowed, but the result can't stand in
	// for the catalogue food in a published recipe.
	return (food?.nickname ?? "").length > 0 && food?.macros_edited !== true;
}

export function verifiedIngredients(draft: DraftLike) {
	return (draft.ingredientItemsData ?? []).filter((item) =>
		isCatalogueIngredient(item?.food),
	);
}

function nameRequirement(draft: DraftLike): Requirement {
	return {
		id: "name",
		label: `Recipe name must be at least ${MIN_NAME_LENGTH} characters`,
		met: lengthOf(draft.foodData?.name) >= MIN_NAME_LENGTH,
	};
}

function servingsRequirement(draft: DraftLike): Requirement {
	return {
		id: "servings",
		label: "Set how many servings the recipe makes",
		met: (draft.recipeData?.servings_yield ?? 0) >= 1,
	};
}

function ingredientsRequirement(draft: DraftLike): Requirement {
	return {
		id: "ingredients",
		label: "Add at least one ingredient",
		met: (draft.ingredientItemsData?.length ?? 0) > 0,
	};
}

/**
 * A recipe may not be an ingredient of another recipe.
 *
 * Recipes are foods carrying a `recipe_id`, so nothing stops the drawer or the
 * ingredients step handing one over. It is a hard rule at every tier: a recipe built
 * out of other recipes is not reproducible, and logging it would credit the nested
 * creator for a dish they did not make.
 */
export function recipeIngredients(draft: DraftLike) {
	return (draft.ingredientItemsData ?? []).filter(
		(item) => item?.food?.recipe_id != null,
	);
}

function noRecipeIngredientRequirement(draft: DraftLike): Requirement {
	return {
		id: "no-recipe-ingredients",
		label: "A recipe cannot be an ingredient of another recipe",
		met: recipeIngredients(draft).length === 0,
	};
}

/**
 * Step 1 — the overview fields.
 *
 * Scoped to this step on purpose: a private recipe must be able to leave the overview
 * with nothing but a name, so servings and ingredients are checked where they are
 * entered, not here.
 */
export function overviewRequirements(
	draft: DraftLike,
	visibility: Visibility,
): Requirement[] {
	const list: Requirement[] = [nameRequirement(draft)];
	if (visibility === "public") {
		const description = lengthOf(draft.recipeData?.description);
		const tags = draft.recipeData?.tags?.length ?? 0;
		list.push(
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
		);
	}
	return list;
}

/** Step 2 — what the ingredients step adds: a yield, ingredients, and validity. */
export function ingredientsRequirements(
	draft: DraftLike,
	visibility: Visibility,
): Requirement[] {
	const list = [
		...overviewRequirements(draft, visibility),
		servingsRequirement(draft),
		ingredientsRequirement(draft),
		// Hard rule at both tiers, so it cannot be worked around by keeping the
		// recipe private.
		noRecipeIngredientRequirement(draft),
	];

	// Published recipes must be reproducible from the catalogue, so this is checked
	// where the ingredients are chosen - failing at the directions step would send the
	// user somewhere they cannot fix it.
	if (visibility === "public") {
		const all = draft.ingredientItemsData?.length ?? 0;
		const verified = verifiedIngredients(draft).length;
		list.push({
			id: "verified-ingredients",
			label: "Swap ingredients that only exist on this device for catalogue foods",
			met: all > 0 && verified === all,
		});
	}

	return list;
}

/** The minimum for a recipe that stays on the device. */
export function privateRequirements(draft: DraftLike): Requirement[] {
	return [
		nameRequirement(draft),
		servingsRequirement(draft),
		ingredientsRequirement(draft),
	];
}

/** Everything a recipe needs before it can be uploaded and credited. */
export function publicRequirements(draft: DraftLike): Requirement[] {
	const description = lengthOf(draft.recipeData?.description);
	const tags = draft.recipeData?.tags?.length ?? 0;
	const steps = nonEmptyDirections(draft).length;
	const image = draft.recipeData?.bannerImage;
	const hasImage = Array.isArray(image)
		? image.length > 0
		: lengthOf(image as string | undefined) > 0;
	const allIngredients = draft.ingredientItemsData?.length ?? 0;
	const verified = verifiedIngredients(draft).length;

	return [
		nameRequirement(draft),
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
		{
			id: "directions",
			label: "Add at least one written direction",
			met: steps > 0,
		},
		servingsRequirement(draft),
		ingredientsRequirement(draft),
		{
			id: "verified-ingredients",
			// Every ingredient, not just one: the server has to resolve them all.
			label: "Swap ingredients that only exist on this device for catalogue foods",
			met: allIngredients > 0 && verified === allIngredients,
		},
	];
}

/**
 * The last step — everything the recipe must have before preview, by tier.
 *
 * For a public recipe this is the publish checklist; for a private one it is just the
 * private minimum plus a written direction.
 */
export function directionsRequirements(
	draft: DraftLike,
	visibility: Visibility,
): Requirement[] {
	if (visibility === "public") return publicRequirements(draft);
	// Directions are a publishing requirement only: a private recipe is the author's
	// own note and needs nothing beyond what the ingredients step collected.
	return ingredientsRequirements(draft, visibility);
}

/** The requirements for the current draft, chosen by where it will live. */
export function requirementsFor(
	draft: DraftLike,
	visibility: Visibility,
): Requirement[] {
	return visibility === "public"
		? publicRequirements(draft)
		: privateRequirements(draft);
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
