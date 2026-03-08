import { db } from "@/db/client";
import { food, foodItem } from "@/db/schema";
import {
    FoodInsert,
    FoodItemData,
    FoodItemInsert,
    FoodType,
} from "@/types/food";
import { eq } from "drizzle-orm";

export const getFood = async (foodID: number) => {
    const res = db.select().from(food).where(eq(food.id, foodID));
    return res;
};
export const getFoodBarcode = async (barcode: string) => {
    const res = db.select().from(food).where(eq(food.barcode, barcode));
    return res;
};
export const insertFoodAndItem = async (
    foodData: Omit<FoodInsert, "recipe_id">,
    foodItemData: FoodItemData,
) => {
    return await db.transaction(async (tx) => {
        const [newFood] = await tx
            .insert(food)
            .values({
                ...foodData,
                id: undefined,
            })
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
            food: newFood,
            foodItem: newFoodItem,
        };
    });
};
export const updateFoodAndItem = async (
    foodData: Omit<FoodInsert, "recipe_id">,
    foodItemData: FoodItemData,
    foodItemID: number,
) => {
    return await db.transaction(async (tx) => {
        const [deletedFoodItem] = await tx
            .delete(foodItem)
            .where(eq(foodItem.id, foodItemID))
            .returning();
        const [newFood] = await tx
            .insert(food)
            .values({
                ...foodData,
                id: undefined,
            })
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
            food: newFood,
            foodItem: newFoodItem,
        };
    });
};

export const updateFood = async (foodID: number, foodObject: FoodType) => {
    return db
        .update(food)
        .set(foodObject)
        .where(eq(food.id, foodID))
        .returning();
};
export const deleteFood = async (foodID: number) => {
    return db.delete(food).where(eq(food.id, foodID)).returning();
};

export const getFoodItem = async (foodItemID: number) => {
    const res = db.select().from(foodItem).where(eq(foodItem.id, foodItemID));
    return res;
};
export const insertFood = async (foodObject: FoodInsert) => {
    return db.insert(food).values(foodObject).returning();
};
export const insertFoodItem = async (foodItemObject: FoodItemInsert) => {
    return db.insert(foodItem).values(foodItemObject).returning();
};
export const insertFoodItems = async (foodItemObject: FoodItemInsert[]) => {
    return db.insert(foodItem).values(foodItemObject).returning();
};

export const updateFoodItem = async (
    foodItemID: number,
    foodItemObject: FoodItemData,
) => {
    return db
        .update(foodItem)
        .set(foodItemObject)
        .where(eq(foodItem.id, foodItemID))
        .returning();
};

export const deleteFoodItem = async (foodItemID: number) => {
    return db.delete(foodItem).where(eq(foodItem.id, foodItemID)).returning();
};
