import { db } from "@/db/client";
import { weightItem } from "@/db/schema";
import { WeightInsert } from "@/types/weight";

import { and, count, desc, gte, lt, sql } from "drizzle-orm";

/**
 * "2026-10-27" -> that day at local midnight.
 *
 * `new Date("2026-10-27")` reads the string as UTC midnight, which is the previous day
 * everywhere west of Greenwich — every label on the chart was a day early.
 */
function parseDayBucket(bucket: string): Date {
    const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bucket);
    if (day) {
        return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
    }
    console.log("weight history: unparseable bucket", bucket);
    return new Date();
}

export const getWeightHistory = async (
    from: Date,
    to: Date,
    period: "day" | "week" | "month" = "day",
) => {
    // Every period emits a *calendar day* ("2026-11-02"): the day itself, the Monday of
    // its week, or the first of its month. One format means one parser, and the chart can
    // place a week or a month exactly where it starts on the time axis.
    //
    // The week is computed as "next Sunday, minus six days", which lands on the Monday of
    // the current week for every day including Sunday itself. `%W` was tried and is not
    // worth it: its keys ("2026-W44") cannot be parsed back into a date.
    const getPeriodBucket = () => {
        switch (period) {
            case "day":
                return sql<string>`strftime('%F', ${weightItem.timestamp}, 'unixepoch', 'localtime')`;
            case "week":
                return sql<string>`strftime('%F', ${weightItem.timestamp}, 'unixepoch', 'localtime', 'weekday 0', '-6 days')`;
            case "month":
                return sql<string>`strftime('%F', ${weightItem.timestamp}, 'unixepoch', 'localtime', 'start of month')`;
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
        // The bucket key is a *calendar day* ("2026-10-27"), not an instant. `new Date`
        // reads that as UTC midnight, which lands on the previous day everywhere west of
        // Greenwich — every label on the chart was a day early. Build it as local time.
        timestamp: parseDayBucket(row.timestamp),
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
