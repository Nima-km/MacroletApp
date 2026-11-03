import { db } from "@/db/client";
import { weightItem } from "@/db/schema";
import { WeightInsert } from "@/types/weight";

import { and, count, desc, gte, lt, sql } from "drizzle-orm";

export const getWeightHistory = async (
    from: Date,
    to: Date,
    period: "day" | "week" | "month" = "day",
) => {
    const getPeriodBucket = () => {
        switch (period) {
            case "day":
                return sql<string>`strftime('%F', ${weightItem.timestamp}, 'unixepoch', 'localtime')`;
            case "week":
                return sql<string>`strftime('%Y-W%W', ${weightItem.timestamp}, 'unixepoch', 'localtime')`;
            case "month":
                return sql<string>`strftime('%Y-%m', ${weightItem.timestamp}, 'unixepoch', 'localtime')`;
        }
    };

    const periodBucket = getPeriodBucket();
    const results = await db
        .select({
            timestamp: periodBucket,
            weight: sql<number>`AVG(${weightItem.weight})`,
            count: sql<number>`COUNT(*)`,
            minWeight: sql<number>`MIN(${weightItem.weight})`,
            maxWeight: sql<number>`MAX(${weightItem.weight})`,
        })
        .from(weightItem)
        .where(
            and(gte(weightItem.timestamp, from), lt(weightItem.timestamp, to)),
        )
        .groupBy(periodBucket)
        .orderBy(periodBucket);
    console.log("Raw results:", JSON.stringify(results, null, 2));
    console.log("First result:", results[0]);
    console.log("First timestamp value:", results[0]?.timestamp);
    console.log("Type of timestamp:", typeof results[0]?.timestamp);
    return results.map((row) => ({
        ...row,
        timestamp: new Date(row.timestamp),
    }));
};

export const insertWeight = async (weightLog: WeightInsert) => {
    console.log("insertNutritionGoal");
    return db.insert(weightItem).values(weightLog);
};

/** Used once, at startup, to decide the default unit for an install that predates units. */
export const countWeightItems = async (): Promise<number> => {
    const [row] = await db.select({ n: count() }).from(weightItem);
    return Number(row?.n ?? 0);
};

/** The most recent weigh-in, whatever window the screens happen to be looking at. */
export const getLatestWeightItem = async () => {
    const rows = await db
        .select()
        .from(weightItem)
        .orderBy(desc(weightItem.timestamp), desc(weightItem.id))
        .limit(1);
    return rows[0] ?? null;
};

/**
 * Every weigh-in in a window, as recorded.
 *
 * The bucketed query above answers "what did the week look like" and averages several
 * readings on the same day into one point. The chart and the history list want the
 * opposite: each reading, with its own time. A day with a morning and an evening
 * weigh-in is two data points, not their mean.
 */
export const getWeightItems = async (from: Date, to: Date) => {
    return db
        .select({ timestamp: weightItem.timestamp, weight: weightItem.weight })
        .from(weightItem)
        .where(and(gte(weightItem.timestamp, from), lt(weightItem.timestamp, to)))
        .orderBy(weightItem.timestamp, weightItem.id);
};

/** Every weigh-in ever recorded, newest first — the history list. */
export const getAllWeightItems = async () => {
    return db
        .select({ id: weightItem.id, timestamp: weightItem.timestamp, weight: weightItem.weight })
        .from(weightItem)
        .orderBy(desc(weightItem.timestamp), desc(weightItem.id));
};
