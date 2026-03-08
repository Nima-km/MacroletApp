import { db } from "@/db/client";
import { food, foodItem } from "@/db/schema";
import { and, desc, eq, gte, isNull, lt, max, sql } from "drizzle-orm";

// for retreving the history of foods ate from-to date

export const getFoodItemHistory = async (from: Date, to: Date) => {
    console.log(
        "getting history from",
        from.toISOString(),
        "to",
        to.toISOString(),
    );
    return db
        .select()
        .from(foodItem)
        .innerJoin(food, eq(foodItem.food_id, food.id))
        .where(and(gte(foodItem.timestamp, from), lt(foodItem.timestamp, to)))
        .orderBy(foodItem.timestamp);
};

// for retreving recently logged foods
interface RecentProps {
    showRecipe?: boolean;
}
export const getFoodItemRecent = async ({ showRecipe = true }: RecentProps) => {
    const latest = db
        .select({
            food_id: foodItem.food_id,
            foodItem_id: foodItem.id,
            max_timestamp: max(foodItem.timestamp).as("max_timestamp"),
        })
        .from(foodItem)
        .groupBy(foodItem.food_id)
        .as("latests");

    console.log("getFoodItemRecent, latest");
    const result = showRecipe
        ? db
              .select({
                  food: food,
                  foodItem: foodItem,
              })
              .from(food)
              .innerJoin(latest, eq(latest.food_id, food.id))
              .innerJoin(
                  foodItem,
                  and(
                      eq(foodItem.id, latest.foodItem_id),
                      eq(foodItem.timestamp, latest.max_timestamp),
                  ),
              )
              .orderBy(desc(foodItem.timestamp))
        : db
              .select({
                  food: food,
                  foodItem: foodItem,
              })
              .from(food)
              .innerJoin(latest, eq(latest.food_id, food.id))
              .innerJoin(
                  foodItem,
                  and(
                      eq(foodItem.id, latest.foodItem_id),
                      eq(foodItem.timestamp, latest.max_timestamp),
                  ),
              )
              .where(isNull(food.recipe_id))
              .orderBy(desc(foodItem.timestamp));
    console.log("getFoodItemRecent, result");
    return result;
};

// for retrieving the total sum of macros logged in foodItem from-to date

export const getFoodItemSum = async (from: Date, to: Date) => {
    //  console.log('getDailyHistory')
    return db
        .select({
            fat: sql<number>`sum(${food.fat} * ${foodItem.servings} * ${foodItem.serving_mult})`,
            carbs: sql<number>`sum(${food.carbs} * ${foodItem.servings} * ${foodItem.serving_mult})`,
            fiber: sql<number>`sum(${food.fiber} * ${foodItem.servings} * ${foodItem.serving_mult})`,
            protein: sql<number>`sum(${food.protein} * ${foodItem.servings} * ${foodItem.serving_mult})`,
            calories: sql<number>`sum((${food.protein} * 4 + ${food.carbs} * 4 + ${food.fat} * 9 - ${food.fiber} * 2) * ${foodItem.servings} * ${foodItem.serving_mult})`,
        })
        .from(foodItem)
        .innerJoin(food, eq(foodItem.food_id, food.id))
        .where(and(gte(foodItem.timestamp, from), lt(foodItem.timestamp, to)));
};
