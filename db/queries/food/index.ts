import { db } from "@/db/client";
import { food, foodItem } from "@/db/schema";
import { FoodInsert, FoodItemInsert, FoodItemType, FoodType } from "@/types/food";
import { eq } from 'drizzle-orm';

export const getFood = async (foodID: number) => {
  const res = db.select().from(food).where(eq(food.id, foodID));
  return res
};
export const insertFood = async (foodObject: FoodInsert) => {
  return db.insert(food).values(foodObject).returning();
};

export const updateFood = async (foodID: number, foodObject: FoodType) => {
  return db.update(food).set(foodObject).where(eq(food.id, foodID)).returning();
};
export const deleteFood = async (foodID: number) => {
  return db.delete(food).where(eq(food.id, foodID)).returning();
};


export const getFoodItem = async (foodItemID: number) => {
  const res = db.select().from(foodItem).where(eq(foodItem.id, foodItemID));
  return res
};
export const insertFoodItem = async (foodItemObject: FoodItemInsert) => {
  return db.insert(foodItem).values(foodItemObject).returning();
};
export const insertFoodItems = async (foodItemObject: FoodItemInsert[]) => {
  return db.insert(foodItem).values(foodItemObject).returning();
};

export const updateFoodItem = async (foodItemID: number, foodItemObject: FoodItemType) => {
  return db.update(foodItem).set(foodItemObject).where(eq(foodItem.id, foodItemID)).returning();
};

export const deleteFoodItem = async (foodItemID: number) => {
  return db.delete(foodItem).where(eq(foodItem.id, foodItemID)).returning();
};