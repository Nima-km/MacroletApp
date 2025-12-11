import { servingSize } from "@/db/schema";

export type ServingSizeInsert = typeof servingSize.$inferInsert;
export type ServingSizeType = Omit<ServingSizeInsert, 'id'>
export type ServingSizeRaw = {
    serving_type: string,
    serving_mult: number,
    servings: number,
}