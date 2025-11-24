import { db } from "@/db/client";
import { servingSize } from "@/db/schema";
import { ServingSizeInsert, ServingSizeType } from "@/types/servingSize";
import { eq } from 'drizzle-orm';

export const getServingSize = async (servingSizeID: number) => {
  const res = db.select().from(servingSize).where(eq(servingSize.id, servingSizeID));
  return res
};
export const getFoodServingSize = async (foodID: number) => {
  const res = db.select().from(servingSize).where(eq(servingSize.food_id, foodID));
  return res
};


export const insertServingSize = async (servingSizeObject: ServingSizeInsert) => {
  return db.insert(servingSize).values(servingSizeObject).returning();
};

export const updateServingSize = async (servingSizeID: number, servingSizeObject: ServingSizeType) => {
  return db.update(servingSize).set(servingSizeObject).where(eq(servingSize.id, servingSizeID)).returning();
};
export const deleteServingSize = async (servingSizeID: number) => {
  return db.delete(servingSize).where(eq(servingSize.id, servingSizeID)).returning();
};