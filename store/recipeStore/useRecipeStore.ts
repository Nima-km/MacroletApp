import { FoodInsert } from "@/types/food";
import {
    IngredientFullData,
    IngredientItemDetails,
    RecipeData,
    RecipeDraft,
    RecipeInsert,
} from "@/types/recipe";
import { create } from "zustand";

import { CalculateMacroSumIngredient } from "@/helper/recipeMacroSum";

export type RecipeDraftType = {
    data: RecipeDraft;
    initializeRecipe: (item: RecipeData) => void;
    updateRecipe: <K extends keyof RecipeInsert>(
        key: K,
        value: RecipeInsert[K],
    ) => void;

    updateFood: <K extends keyof Omit<FoodInsert, "recipe_id">>(
        key: K,
        value: Omit<FoodInsert, "recipe_id">[K],
    ) => void;

    addIngredient: (item: Array<Omit<IngredientFullData, "recipe_id">>) => void;
    updateIngredient: (
        index: number,

        value: IngredientItemDetails,
    ) => void;

    removeIngredient: (index: number) => void;
    reset: () => void;
};

export const emptyDraft: RecipeDraft = {
    recipeData: {},
    foodData: {},
    ingredientItemsData: [],
};

export const useRecipeDraftStore = create<RecipeDraftType>((set) => ({
    data: emptyDraft,
    initializeRecipe: (item) =>
        set((state) => ({
            data: item,
        })),
    updateRecipe: (key, value) =>
        set((state) => ({
            data: {
                ...state.data,
                recipeData: {
                    ...state.data.recipeData,
                    [key]: value,
                },
                foodData: {
                    ...state.data.foodData,
                    ...CalculateMacroSumIngredient(
                        [...state.data.ingredientItemsData],
                        key === "servings_yield" && typeof value === "number"
                            ? value
                            : state.data.recipeData.servings_yield,
                    ),
                },
            },
        })),

    updateFood: (key, value) =>
        set((state) => ({
            data: {
                ...state.data,
                foodData: {
                    ...state.data.foodData,
                    [key]: value,
                },
            },
        })),

    addIngredient: (item) =>
        set((state) => ({
            data: {
                ...state.data,
                ingredientItemsData: [
                    ...state.data.ingredientItemsData,
                    ...item,
                ],
                foodData: {
                    ...state.data.foodData,
                    ...CalculateMacroSumIngredient(
                        [...state.data.ingredientItemsData, ...item],
                        state.data.recipeData.servings_yield,
                    ),
                },
            },
        })),

    updateIngredient: (index, value) =>
        set((state) => {
            const items = [...state.data.ingredientItemsData];
            items[index].ingredientItem = value;

            return {
                data: {
                    ...state.data,
                    ingredientItemsData: items,
                    foodData: {
                        ...state.data.foodData,
                        ...CalculateMacroSumIngredient(
                            items,
                            state.data.recipeData.servings_yield,
                        ),
                    },
                },
            };
        }),

    removeIngredient: (index) =>
        set((state) => ({
            data: {
                ...state.data,
                ingredientItemsData: state.data.ingredientItemsData.filter(
                    (_, i) => i !== index,
                ),
                foodData: {
                    ...state.data.foodData,
                    ...CalculateMacroSumIngredient(
                        state.data.ingredientItemsData.filter(
                            (_, i) => i !== index,
                        ),
                        state.data.recipeData.servings_yield,
                    ),
                },
            },
        })),

    reset: () => set({ data: emptyDraft }),
}));

function TST() {
    return { P: 10 };
}

export const useRecipeStateStore = create<RecipeDraftType>((set) => ({
    data: emptyDraft,

    initializeRecipe: (item) =>
        set(() => ({
            data: item,
        })),
    updateRecipe: (key, value) =>
        set((state) => ({
            data: {
                ...state.data,
                recipeData: {
                    ...state.data.recipeData,
                    [key]: value,
                },
                foodData: {
                    ...state.data.foodData,
                    ...CalculateMacroSumIngredient(
                        [...state.data.ingredientItemsData],
                        key === "servings_yield" && typeof value === "number"
                            ? value
                            : state.data.recipeData.servings_yield,
                    ),
                },
            },
        })),

    updateFood: (key, value) =>
        set((state) => ({
            data: {
                ...state.data,
                foodData: {
                    ...state.data.foodData,
                    [key]: value,
                },
            },
        })),

    addIngredient: (item) =>
        set((state) => ({
            data: {
                ...state.data,
                ingredientItemsData: [
                    ...state.data.ingredientItemsData,
                    ...item,
                ],
                foodData: {
                    ...state.data.foodData,
                    ...CalculateMacroSumIngredient(
                        [...state.data.ingredientItemsData, ...item],
                        state.data.recipeData.servings_yield,
                    ),
                },
            },
        })),

    updateIngredient: (index, value) =>
        set((state) => {
            const items = [...state.data.ingredientItemsData];
            items[index].ingredientItem = value;

            return {
                data: {
                    ...state.data,
                    ingredientItemsData: items,
                    foodData: {
                        ...state.data.foodData,
                        ...CalculateMacroSumIngredient(
                            items,
                            state.data.recipeData.servings_yield,
                        ),
                    },
                },
            };
        }),

    removeIngredient: (index) =>
        set((state) => ({
            data: {
                ...state.data,
                ingredientItemsData: state.data.ingredientItemsData.filter(
                    (_, i) => i !== index,
                ),
                foodData: {
                    ...state.data.foodData,
                    ...CalculateMacroSumIngredient(
                        state.data.ingredientItemsData.filter(
                            (_, i) => i !== index,
                        ),
                        state.data.recipeData.servings_yield,
                    ),
                },
            },
        })),

    reset: () => set({ data: emptyDraft }),
}));

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export function validateRecipeDraft(draft: RecipeDraft): ValidationResult {
    const errors: string[] = [];

    // Check food name
    if (typeof draft.foodData.name !== "string") {
        errors.push("Food name cannot be empty");
    } else if (draft.foodData.name.trim() === "") {
        errors.push("Food name cannot be empty");
    }

    // Check servings yield exists and is valid
    if (typeof draft.recipeData.servings_yield !== "number") {
        errors.push("Servings yield must not be empty");
    } else if (draft.recipeData.servings_yield <= 0) {
        errors.push("Servings yield must be greater than 0");
    }

    // Check ingredient items exist
    if (!Array.isArray(draft.ingredientItemsData)) {
        errors.push("Ingredient items must be valid");
    } else if (draft.ingredientItemsData.length === 0) {
        errors.push("Recipe must have at least one ingredient");
    } else {
        // Validate each ingredient item
        draft.ingredientItemsData.forEach((ingredient, index) => {
            const ingredientPrefix = `Ingredient ${index + 1}`;

            // Validate food data
            if (typeof ingredient.food.id !== "number") {
                errors.push(`${ingredientPrefix}: Food ID must be a number`);
            }
            if (typeof ingredient.food.protein !== "number") {
                errors.push(`${ingredientPrefix}: Protein must be a number`);
            }
            if (typeof ingredient.food.fat !== "number") {
                errors.push(`${ingredientPrefix}: Fat must be a number`);
            }
            if (typeof ingredient.food.carbs !== "number") {
                errors.push(`${ingredientPrefix}: Carbs must be a number`);
            }
            if (typeof ingredient.food.fiber !== "number") {
                errors.push(`${ingredientPrefix}: Fiber must be a number`);
            }

            // Validate ingredient item data
            if (typeof ingredient.ingredientItem.servings !== "number") {
                errors.push(`${ingredientPrefix}: Servings must be a number`);
            } else if (ingredient.ingredientItem.servings <= 0) {
                errors.push(
                    `${ingredientPrefix}: Servings must be greater than 0`,
                );
            }
            if (typeof ingredient.ingredientItem.serving_mult !== "number") {
                errors.push(
                    `${ingredientPrefix}: Serving multiplier must be a number`,
                );
            } else if (ingredient.ingredientItem.serving_mult <= 0) {
                errors.push(
                    `${ingredientPrefix}: Serving multiplier must be greater than 0`,
                );
            }
            if (typeof ingredient.ingredientItem.serving_type !== "string") {
                errors.push(
                    `${ingredientPrefix}: Serving type must be a string`,
                );
            } else if (ingredient.ingredientItem.serving_type.trim() === "") {
                errors.push(
                    `${ingredientPrefix}: Serving type cannot be empty`,
                );
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Type guard function (keeps your original functionality)
export function isValidRecipeDraft(draft: RecipeDraft): draft is {
    recipeData: RecipeInsert;
    foodData: Omit<FoodInsert, "recipe_id">;
    ingredientItemsData: IngredientFullData[];
} {
    return validateRecipeDraft(draft).isValid;
}
