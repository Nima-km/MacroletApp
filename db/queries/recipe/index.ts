import { db } from "@/db/client";
import { food, foodItem, ingredientItem, recipe } from "@/db/schema";
import { FoodInsert, FoodItemInsert, FoodType } from "@/types/food";
import {
    IngredientFullData,
    IngredientItemInsert,
    IngredientItemType,
    RecipeInsert,
    RecipeType,
} from "@/types/recipe";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

export const getRecipeFromRecipeID = async (recipeID: number) => {
    const res = db
        .select()
        .from(food)
        .innerJoin(recipe, eq(food.recipe_id, recipe.id))
        .where(eq(food.recipe_id, recipeID));
    return res;
};
export const getIngredientsFromRecipeID = async (recipeID: number) => {
    const res = db
        .select()
        .from(food)
        .innerJoin(recipe, eq(food.recipe_id, recipe.id))
        .where(eq(food.recipe_id, recipeID));
    return res;
};
export const getRecipeFromFoodID = async (foodID: number) => {
    const res = db
        .select()
        .from(food)
        .innerJoin(recipe, eq(food.recipe_id, recipe.id))
        .where(eq(food.id, foodID));
    return res;
};
export const getIngredientsFromFoodID = async (foodID: number) => {
    const ingredientFoodData = alias(food, "ingredientFoodData");
    const res = db
        .select({
            ingredientItem: ingredientItem,
            food: ingredientFoodData,
        })
        .from(food)
        .innerJoin(recipe, eq(food.recipe_id, recipe.id))
        .innerJoin(ingredientItem, eq(recipe.id, ingredientItem.recipe_id))
        .innerJoin(
            ingredientFoodData,
            eq(ingredientFoodData.id, ingredientItem.ingredient_id),
        )
        .where(eq(food.id, foodID));
    return res;
};

// DO NOT USE, FOR TESTING PURPOSES ONLY. USE TRANSACTION TO CREATE RECIPE BECAUSE IT NEEDS FOOD ENTRY AND INGREDIENT ENTRY
/*
export const insertRecipe = async (recipeObject: RecipeData) => {
  const recipeReturn = await db.insert(recipe).values(recipeObject.recipe).returning();
  recipeObject.food.recipe_id = recipeReturn[0].id
  
};
*/
export const createRecipeWithFoodAndIngredients = async (
    recipeData: RecipeInsert,
    foodData: Omit<FoodInsert, "recipe_id">,
    ingredientItemsData: Array<Omit<IngredientFullData, "recipe_id">>,
) => {
    return await db.transaction(async (tx) => {
        // 1. Insert recipe
        const [newRecipe] = await tx
            .insert(recipe)
            .values(recipeData)
            .returning();

        // 2. Insert food with the recipe_id
        const [newFood] = await tx
            .insert(food)
            .values({
                ...foodData,
                recipe_id: newRecipe.id,
            })
            .returning();

        // 3. Prepare all ingredient items with the correct IDs
        const ingredientItemsWithIds = ingredientItemsData.map(
            (ingredientData) => ({
                ...ingredientData.ingredientItem,
                id: undefined,
                recipe_id: newRecipe.id,
                ingredient_id: ingredientData.food.id,
            }),
        );

        // 4. Batch insert all ingredient items at once
        const newIngredientItems = await tx
            .insert(ingredientItem)
            .values(ingredientItemsWithIds)
            .returning();

        return {
            recipe: newRecipe,
            food: newFood,
            ingredientItems: newIngredientItems,
        };
    });
};
export const createAndLogRecipeWithFoodAndIngredients = async (
    recipeData: RecipeInsert,
    foodData: Omit<FoodInsert, "recipe_id">,
    foodItemData: Omit<FoodItemInsert, "food_id">,
    ingredientItemsData: Array<Omit<IngredientFullData, "recipe_id">>,
) => {
    return await db.transaction(async (tx) => {
        // 1. Insert recipe
        const [newRecipe] = await tx
            .insert(recipe)
            .values({ ...recipeData, id: undefined })
            .returning();

        // 2. Insert food with the recipe_id
        const [newFood] = await tx
            .insert(food)
            .values({
                ...foodData,
                id: undefined,
                recipe_id: newRecipe.id,
            })
            .returning();

        // 3. Prepare all ingredient items with the correct IDs
        const ingredientItemsWithIds = ingredientItemsData.map(
            (ingredientData) => ({
                ...ingredientData.ingredientItem,
                id: undefined,
                recipe_id: newRecipe.id,
                ingredient_id: ingredientData.food.id,
            }),
        );

        // 4. Batch insert all ingredient items at once
        const newIngredientItems = await tx
            .insert(ingredientItem)
            .values(ingredientItemsWithIds)
            .returning();
        const [newFoodItem] = await tx
            .insert(foodItem)
            .values({
                ...foodItemData,
                food_id: newFood.id,
                id: undefined,
            })
            .returning();
        return {
            recipe: newRecipe,
            food: newFood,
            ingredientItems: newIngredientItems,
            foodItem: newFoodItem,
        };
    });
};
export const createAndLogOnlineRecipe = async (
    recipeData: RecipeInsert,
    foodData: Omit<FoodInsert, "recipe_id">,
    foodItemData: Omit<FoodItemInsert, "food_id">,
    ingredientItemsData: Array<Omit<IngredientFullData, "recipe_id">>,
) => {
    return await db.transaction(async (tx) => {
        // 1. Insert recipe
        const [newRecipe] = await tx
            .insert(recipe)
            .values({ ...recipeData, id: undefined })
            .returning();

        // 2. Insert food with the recipe_id
        const [newFood] = await tx
            .insert(food)
            .values({
                ...foodData,
                id: undefined,
                recipe_id: newRecipe.id,
            })
            .returning();

        const ingredientsWithIds = ingredientItemsData.map(
            (ingredientData) => ({
                food: {
                    ...ingredientData.food,
                    id: undefined,
                    barcode: undefined,
                },
                ingredientItem: {
                    ...ingredientData.ingredientItem,
                    id: undefined,
                    recipe_id: newRecipe.id,
                },
            }),
        );
        const ingredientItemsWithIds: IngredientItemInsert[] = [];

        for (const item of ingredientsWithIds) {
            const result = await tx
                .insert(food)
                .values(item.food)
                .returning({ id: food.id });

            const insertedAId = result[0].id;

            ingredientItemsWithIds.push({
                ...item.ingredientItem,
                ingredient_id: insertedAId,
            });
        }

        // 4. Batch insert all ingredient items at once
        const newIngredientItems = await tx
            .insert(ingredientItem)
            .values(ingredientItemsWithIds)
            .returning();
        const [newFoodItem] = await tx
            .insert(foodItem)
            .values({
                ...foodItemData,
                food_id: newFood.id,
                id: undefined,
            })
            .returning();
        return {
            recipe: newRecipe,
            food: newFood,
            ingredientItems: newIngredientItems,
            foodItem: newFoodItem,
        };
    });
};

export const updateRecipeWithFoodAndIngredients = async (
    recipeId: number,
    recipeData: RecipeType,
    foodData: FoodType,
    ingredientItemsData: Array<Omit<IngredientItemInsert, "recipe_id">>,
) => {
    return await db.transaction(async (tx) => {
        // 1. Update recipe
        const [updatedRecipe] = await tx
            .update(recipe)
            .set(recipeData)
            .where(eq(recipe.id, recipeId))
            .returning();

        // 2. Update food
        const [updatedFood] = await tx
            .update(food)
            .set(foodData)
            .where(eq(food.recipe_id, recipeId))
            .returning();

        // 3. Delete all existing ingredient items and recreate
        await tx
            .delete(ingredientItem)
            .where(eq(ingredientItem.recipe_id, recipeId));

        // 4. Insert new ingredient items
        const newIngredients = await tx
            .insert(ingredientItem)
            .values(
                ingredientItemsData.map((item) => ({
                    ...item,
                    recipe_id: recipeId,
                })),
            )
            .returning();

        return {
            recipe: updatedRecipe,
            food: updatedFood,
            ingredientItems: newIngredients,
        };
    });
};

export const updateRecipe = async (
    recipeID: number,
    recipeObject: RecipeType,
) => {
    return db
        .update(recipe)
        .set(recipeObject)
        .where(eq(recipe.id, recipeID))
        .returning();
};
export const deleteRecipe = async (recipeID: number) => {
    return db.delete(recipe).where(eq(recipe.id, recipeID)).returning();
};

export const getIngredientItem = async (ingredientItemID: number) => {
    const res = db
        .select()
        .from(ingredientItem)
        .where(eq(ingredientItem.id, ingredientItemID));
    return res;
};
export const insertIngredientItem = async (
    ingredientItemObject: IngredientItemInsert,
) => {
    return db.insert(ingredientItem).values(ingredientItemObject).returning();
};

export const updateIngredientItem = async (
    ingredientItemID: number,
    ingredientItemObject: IngredientItemType,
) => {
    return db
        .update(ingredientItem)
        .set(ingredientItemObject)
        .where(eq(ingredientItem.id, ingredientItemID))
        .returning();
};

export const deleteIngredientItem = async (ingredientItemID: number) => {
    return db
        .delete(ingredientItem)
        .where(eq(ingredientItem.id, ingredientItemID))
        .returning();
};
