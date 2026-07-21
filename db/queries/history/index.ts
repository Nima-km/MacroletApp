import { db } from "@/db/client";
import { food, foodItem } from "@/db/schema";
import { MacroDateType, RecentFoodFullData } from "@/types/food";
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
export const getFoodItemRecent = async ({
	showRecipe = true,
}: RecentProps): Promise<RecentFoodFullData[]> => {
	const latest = db
		.select({
			food_id: foodItem.food_id,
			foodItem_id: foodItem.id,
			max_timestamp: max(foodItem.timestamp).as("max_timestamp"),
		})
		.from(foodItem)
		.groupBy(foodItem.food_id)
		.as("latests");

	const result = showRecipe
		? db
				.select({
					food: food,
					foodItem: foodItem,
				})
				.from(food)
				.leftJoin(latest, eq(latest.food_id, food.id))
				.leftJoin(
					foodItem,
					and(
						eq(foodItem.id, latest.foodItem_id),
						eq(foodItem.timestamp, latest.max_timestamp),
					),
				)
				.orderBy(
					desc(foodItem.timestamp),
					desc(foodItem.id), // fallback for nulls (sqlite doesn't support NULLS LAST)
				)
		: db
				.select({
					food: food,
					foodItem: foodItem,
				})
				.from(food)
				.leftJoin(latest, eq(latest.food_id, food.id))
				.leftJoin(
					foodItem,
					and(
						eq(foodItem.id, latest.foodItem_id),
						eq(foodItem.timestamp, latest.max_timestamp),
					),
				)
				.where(isNull(food.recipe_id))
				.orderBy(
					desc(foodItem.timestamp),
					desc(foodItem.id), // fallback for nulls
				);

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

// for retrieving daily sums of macros, from a date to a date (used to display daily history)
export type Period = "day" | "week" | "month";
export const getDailyFoodSums = async (
	from: Date,
	to: Date,
	type: Period,
): Promise<MacroDateType[]> => {
	const results = [];
	// Start from the 'from' date
	const currentDate = new Date(from);
	currentDate.setHours(0, 0, 0, 0);

	// Loop until we reach the 'to' date
	while (currentDate < to) {
		const nextDate = new Date(currentDate);
		nextDate.setDate(nextDate.getDate() + 1);

		const row = await getFoodItemSum(currentDate, nextDate);
		console.log("row is", currentDate);
		results.push({
			date: new Date(currentDate),
			fat: row[0]?.fat ?? 0,
			carbs: row[0]?.carbs ?? 0,
			fiber: row[0]?.fiber ?? 0,
			protein: row[0]?.protein ?? 0,
			calories: row[0]?.calories ?? 0,
		});

		currentDate.setDate(currentDate.getDate() + 1);
	}
	return results;
};
