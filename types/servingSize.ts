import { servingSize } from "@/db/schema";

export type ServingSizeInsert = typeof servingSize.$inferInsert;
export type ServingSizeType = Omit<ServingSizeInsert, 'id'>