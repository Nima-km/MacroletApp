import { db } from "@/db/client";
import { food, foodItem } from "@/db/schema";
import { sql } from "drizzle-orm";
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
	if (foodData.name.length < 3) {
		throw Error("food name is too short");
	}
	return await db.transaction(async (tx) => {
		const [newFood] = await tx
			.insert(food)
			.values({
				...foodData,
			})
			.onConflictDoNothing()
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
		const [deletedFood] = await tx
			.delete(food)
			.where(eq(food.id, deletedFoodItem.food_id))
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
/**
 * Insert foods coming from the server, keyed on the nickname it assigns them.
 *
 * This used `onConflictDoNothing`, which has a trap: when a row already exists the
 * statement inserts nothing, so `returning()` has nothing to return - and a repeated
 * search for the same term came back with an empty list. Updating instead returns the
 * existing row, which also refreshes its nutrition, so a corrected value on the server
 * reaches the device rather than being frozen at first fetch.
 *
 * The contract this depends on: the server's nickname must be stable for a given food.
 */
export const insertFoodList = async (foodObjects: FoodInsert[]) => {
	return db
		.insert(food)
		.values(foodObjects)
		.onConflictDoUpdate({
			target: food.nickname,
			set: {
				name: sql`excluded.name`,
				protein: sql`excluded.protein`,
				fat: sql`excluded.fat`,
				carbs: sql`excluded.carbs`,
				fiber: sql`excluded.fiber`,
				barcode: sql`excluded.barcode`,
				serving_100g: sql`excluded.serving_100g`,
				volume_100ml: sql`excluded.volume_100ml`,
				micro_nutriants: sql`excluded.micro_nutriants`,
			},
		})
		.returning();
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
