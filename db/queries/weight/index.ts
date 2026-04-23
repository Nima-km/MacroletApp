import { db } from "@/db/client";
import { weightItem } from "@/db/schema";
import { WeightInsert } from "@/types/weight";

import { and, gte, lt } from "drizzle-orm";

export const getWeightHistory = async (from: Date, to: Date) => {
    return db
        .select()
        .from(weightItem)
        .where(
            and(gte(weightItem.timestamp, from), lt(weightItem.timestamp, to)),
        )
        .orderBy(weightItem.timestamp);
};

export const insertWeight = async (weightLog: WeightInsert) => {
    console.log("insertNutritionGoal");
    return db.insert(weightItem).values(weightLog);
};
