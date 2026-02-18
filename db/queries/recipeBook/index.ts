import { db } from "@/db/client";
import { food, recipe, recipeBook, recipeBookItem } from "@/db/schema";
import {
    RecipeBookInsert,
    RecipeBookItemInsert,
    RecipeBookItemType,
    RecipeBookType,
} from "@/types/recipe";
import { eq } from "drizzle-orm";

/*
export const getRecipeBook = async (recipeBookID: number) => {
  const res = db.select().from(recipeBook).where(eq(recipeBook.id, recipeBookID));
  return res
};
*/
export const getRecipeBookList = async () => {
    const res = await db.query.recipeBook.findMany({
        with: {
            items: true,
        },
    });
    return res;
};
export const getRecipeBook = async (recipeBookID: number) => {
    const res = await db.query.recipeBook.findFirst({});
    return res;
};
export const getRecipeBookData = async (recipeBookID: number) => {
    const res = await db
        .select({
            recipeData: recipe,
            foodData: food,
        })
        .from(recipeBookItem)
        .innerJoin(recipe, eq(recipe.id, recipeBookItem.recipe_id))
        .innerJoin(food, eq(food.recipe_id, recipe.id))
        .where(eq(recipeBookItem.recipeBook_id, recipeBookID));
    return res;
};
export const insertRecipeBook = async (recipeBookObject: RecipeBookInsert) => {
    return db.insert(recipeBook).values(recipeBookObject).returning();
};

export const updateRecipeBook = async (
    recipeBookID: number,
    recipeBookObject: RecipeBookType,
) => {
    return db
        .update(recipeBook)
        .set(recipeBookObject)
        .where(eq(recipeBook.id, recipeBookID))
        .returning();
};
export const deleteRecipeBook = async (recipeBookID: number) => {
    return db
        .delete(recipeBook)
        .where(eq(recipeBook.id, recipeBookID))
        .returning();
};

export const getRecipeBookItemData = async (recipeBookItemID: number) => {
    const res = db
        .select()
        .from(recipeBookItem)
        .where(eq(recipeBookItem.id, recipeBookItemID));
    return res;
};
export const insertRecipeBookItem = async (
    recipeBookItemObject: RecipeBookItemInsert,
) => {
    return db.insert(recipeBookItem).values(recipeBookItemObject).returning();
};

export const updateRecipeBookItem = async (
    recipeBookItemID: number,
    recipeBookItemObject: RecipeBookItemType,
) => {
    return db
        .update(recipeBookItem)
        .set(recipeBookItemObject)
        .where(eq(recipeBookItem.id, recipeBookItemID))
        .returning();
};
export const deleteRecipeBookItem = async (recipeBookItemID: number) => {
    return db
        .delete(recipeBookItem)
        .where(eq(recipeBookItem.id, recipeBookItemID))
        .returning();
};
