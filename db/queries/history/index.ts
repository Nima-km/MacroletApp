import { db } from "@/db/client";
import { food, foodItem } from "@/db/schema";
import { and, eq, gte, lt, max, sql } from 'drizzle-orm';

// for retreving the history of foods ate from-to date

export const getFoodItemHistory = async (from: Date, to: Date) => {
    console.log('getting history from', from.toISOString(), 'to', to.toISOString())
    return db.select().from(foodItem).innerJoin(food, eq(foodItem.food_id, food.id))
        .where(and(
            gte(foodItem.timestamp, from), 
            lt(foodItem.timestamp, to)))
        .orderBy(foodItem.timestamp)
};

// for retreving recently logged foods

export const getFoodItemRecent = async () => {
    console.log("getFoodItemRecent got hit")
    const latest = db.select({
        food_id: foodItem.food_id,
        max_imestamp: max(foodItem.timestamp).as("max_imestamp") 
    })
    .from(foodItem)
    .groupBy(foodItem.food_id)
    .as("latests");

    console.log("getFoodItemRecent, latest")
    const result = db.select({
        food: food,
        foodItem: foodItem
    })
    .from(food)
    .innerJoin(latest, eq(latest.food_id, food.id))
    .innerJoin(
        foodItem,
        and(
            eq(foodItem.food_id, latest.food_id),
            eq(foodItem.timestamp, latest.max_imestamp)
        )
    )
    .orderBy(foodItem.timestamp)
    console.log("getFoodItemRecent, result")
    return result
};

// for retrieving the total sum of macros logged in foodItem from-to date

export const getFoodItemSum = async (from: Date, to: Date) => {
//  console.log('getDailyHistory')
  return db.select({
        fat: sql<number>`sum(${food.fat} * ${foodItem.servings} * ${foodItem.serving_mult})`,
        carbs: sql<number>`sum(${food.carbs} * ${foodItem.servings} * ${foodItem.serving_mult})`,
        fiber: sql<number>`sum(${food.fiber} * ${foodItem.servings} * ${foodItem.serving_mult})`,
        protein: sql<number>`sum(${food.protein} * ${foodItem.servings} * ${foodItem.serving_mult})`,
        calories: sql<number>`sum((${food.protein} * 4 + ${food.carbs} * 4 + ${food.fat} * 9 - ${food.fiber} * 2) * ${foodItem.servings} * ${foodItem.serving_mult})`,
      })
      .from(foodItem).innerJoin(food, eq(foodItem.food_id, food.id))
      .where(and( 
        gte(foodItem.timestamp, from), 
        lt(foodItem.timestamp, to)))
};