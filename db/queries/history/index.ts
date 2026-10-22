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

// for retrieving daily sums of macros across a range (used to display daily history)
export type Period = "day" | "week" | "month";

/** Local `YYYY-MM-DD`, matching SQLite's `date(..., 'localtime')` output. */
function toDayKey(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Daily macro totals for a range.
 *
 * This used to loop over the range and call `getFoodItemSum` once per day: a 90-day
 * view meant 90 sequential queries, which is why the range was capped at 21 days.
 * One grouped query does the whole range in a single pass, and the
 * `food_item_timestamp_idx` index lets SQLite walk the range rather than the table.
 *
 * Days with nothing logged are still returned, at zero - the chart needs a
 * continuous series or gaps collapse into a single point.
 */
export const getDailyFoodSums = async (
	from: Date,
	to: Date,
): Promise<MacroDateType[]> => {
	const dayBucket = sql<string>`date(${foodItem.timestamp}, 'unixepoch', 'localtime')`;

	const rows = await db
		.select({
			day: dayBucket,
			fat: sql<number>`sum(${food.fat} * ${foodItem.servings} * ${foodItem.serving_mult})`,
			carbs: sql<number>`sum(${food.carbs} * ${foodItem.servings} * ${foodItem.serving_mult})`,
			fiber: sql<number>`sum(${food.fiber} * ${foodItem.servings} * ${foodItem.serving_mult})`,
			protein: sql<number>`sum(${food.protein} * ${foodItem.servings} * ${foodItem.serving_mult})`,
			calories: sql<number>`sum((${food.protein} * 4 + ${food.carbs} * 4 + ${food.fat} * 9 - ${food.fiber} * 2) * ${foodItem.servings} * ${foodItem.serving_mult})`,
		})
		.from(foodItem)
		.innerJoin(food, eq(foodItem.food_id, food.id))
		.where(and(gte(foodItem.timestamp, from), lt(foodItem.timestamp, to)))
		.groupBy(dayBucket);

	const byDay = new Map(rows.map((row) => [row.day, row]));

	const results: MacroDateType[] = [];
	const cursor = new Date(from);
	cursor.setHours(0, 0, 0, 0);

	while (cursor < to) {
		const row = byDay.get(toDayKey(cursor));
		results.push({
			date: new Date(cursor),
			fat: row?.fat ?? 0,
			carbs: row?.carbs ?? 0,
			fiber: row?.fiber ?? 0,
			protein: row?.protein ?? 0,
			calories: row?.calories ?? 0,
		});
		cursor.setDate(cursor.getDate() + 1);
	}

	return results;
};
