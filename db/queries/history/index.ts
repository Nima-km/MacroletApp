import { db } from "@/db/client";
import { food, foodItem } from "@/db/schema";
import { MacroDateType, RecentFoodFullData } from "@/types/food";
import { and, desc, eq, gte, isNull, like, lt, max, sql } from "drizzle-orm";

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
/** How many rows the Recent list displays. */
export const RECENT_LIST_LIMIT = 4;

interface RecentProps {
	showRecipe?: boolean;
	/**
	 * Name filter, applied in SQL. Filtering in JS afterwards would force the query
	 * to return every food for a search to reach an old one - which is exactly what
	 * made this unbounded.
	 */
	term?: string;
	limit?: number;
	offset?: number;
}
export const getFoodItemRecent = async ({
	showRecipe = true,
	term = "",
	limit = RECENT_LIST_LIMIT,
	offset = 0,
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

	const search = term.trim();

	const result = db
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
		.where(
			and(
				// `and` drops undefined terms, so an empty filter is no filter.
				showRecipe ? undefined : isNull(food.recipe_id),
				search ? like(food.name, `%${search}%`) : undefined,
			),
		)
		.orderBy(
			desc(foodItem.timestamp),
			desc(foodItem.id), // fallback for nulls (sqlite sorts NULLs first on ASC)
		)
		.limit(limit)
		.offset(offset);

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
