import { db } from "@/db/client";
import { weightItem } from "@/db/schema";
import { WeightInsert } from "@/types/weight";

import { and, gte, lt, sql } from "drizzle-orm";

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
