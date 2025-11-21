import { servingSize } from "@/db/schema";

export type ServingSizeInsert = typeof servingSize.$inferInsert;

export type ServingSizeType = {
    serving_type: string,
    serving_multiplier: number,
}