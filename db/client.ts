import { DATABASE_NAME } from "@/app/_layout";
import { drizzle } from 'drizzle-orm/expo-sqlite'; // community wrapper
import { openDatabaseSync } from "expo-sqlite";

const expoDb = openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expoDb);
