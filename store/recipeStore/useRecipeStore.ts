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

const emptyDraft: RecipeDraft = {
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
                        state.data.recipeData.servings_yield,
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
                        ...CalculateMacroSumIngredient(items),
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
                        state.data.recipeData.servings_yield,
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
                        ...CalculateMacroSumIngredient(items),
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
                    ),
                },
            },
        })),

    reset: () => set({ data: emptyDraft }),
}));

export function isValidRecipeDraft(draft: RecipeDraft): draft is {
    recipeData: RecipeInsert;
    foodData: Omit<FoodInsert, "recipe_id">;
    ingredientItemsData: IngredientFullData[];
} {
    return (
        typeof draft.foodData.name === "string" &&
        draft.ingredientItemsData.length > 0 &&
        draft.ingredientItemsData.every(
            (i) =>
                typeof i.food.id === "number" &&
                typeof i.food.protein === "number" &&
                typeof i.food.fat === "number" &&
                typeof i.food.carbs === "number" &&
                typeof i.food.fiber === "number" &&
                typeof i.ingredientItem.servings === "number" &&
                typeof i.ingredientItem.serving_mult === "number" &&
                typeof i.ingredientItem.serving_type === "string",
        )
    );
}
