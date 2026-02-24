import { getRecipeBookList } from "@/db/queries/recipeBook";
import {
    ingredientItem,
    recipe,
    recipeBook,
    recipeBookItem,
} from "@/db/schema";
import { FoodGet, FoodInsert } from "./food";

export type RecipeInsert = typeof recipe.$inferInsert;
export type IngredientItemInsert = typeof ingredientItem.$inferInsert;
export type RecipeBookInsert = typeof recipeBook.$inferInsert;
export type RecipeBookItemInsert = typeof recipeBookItem.$inferInsert;

export type RecipeType = Omit<RecipeInsert, "id">;

export type IngredientItemType = Omit<IngredientItemInsert, "id">;
export type IngredientItemDetails = Omit<
    IngredientItemInsert,
    "id" | "recipe_id" | "ingredient_id"
>;
export type RecipeBookType = Omit<RecipeBookInsert, "id">;
export type RecipeBookWithItems = Awaited<
    ReturnType<typeof getRecipeBookList>
>[number];
export type RecipeBookItemType = Omit<RecipeBookItemInsert, "id">;
export type IngredientFullData = {
    food: FoodGet;
    ingredientItem: IngredientItemDetails;
};
export type RecipeData = {
    recipeData: RecipeInsert;
    foodData: Omit<FoodInsert, "recipe_id">;
    ingredientItemsData: Array<IngredientFullData>;
};

export type RecipeDraft = {
    recipeData: Partial<RecipeInsert>;
    foodData: Partial<Omit<FoodInsert, "recipe_id">>;
    ingredientItemsData: Array<IngredientFullData>;
};

export type DirectionStep = {
    id: string;
    text: string;
    photo: string;
};
export type RecipeTags = {
    tag: string;
};

const emptyDraft: RecipeDraft = {
    recipeData: {},
    foodData: {},
    ingredientItemsData: [],
};
