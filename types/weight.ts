import { weightItem } from "@/db/schema";

export type WeightInsert = typeof weightItem.$inferInsert;
export type WeightGet = typeof weightItem.$inferSelect;
export type WeightType = Omit<WeightGet, "id">;
