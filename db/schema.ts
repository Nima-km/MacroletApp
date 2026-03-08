import { DirectionStep, RecipeTags } from "@/types/recipe";
import { relations, sql } from "drizzle-orm";
import {
    integer,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const food = sqliteTable(
    "food",
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        name: text("name", { length: 250 }).notNull(),
        nickname: text("nickname"),
        // Macronutrients per 100g (or standard unit)
        protein: integer("protein").notNull(),
        fat: integer("fat").notNull(),
        carbs: integer("carbs").notNull(),
        fiber: integer("fiber").notNull(),

        barcode: text("barcode").default(""),
        serving_100g: integer("serving_100g").default(0).notNull(),
        volume_100ml: integer("volume_100ml").default(0).notNull(),
        micro_nutriants: text("micro_nutriants", { mode: "json" }),

        recipe_id: integer("recipe_id").references(() => recipe.id),
    },
    (table) => ({
        nicknameUnique: uniqueIndex("users_nickname_unique").on(table.nickname),
    }),
);
export const recipe = sqliteTable("recipe", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    servings_yield: integer("servings_yield").default(0).notNull(),
    recipe_slug: text("recipe_slug", { length: 50 }),
    description: text("description", { length: 250 }),
    note: text("description", { length: 2000 }),
    directions: text("directions", { mode: "json" }).$type<DirectionStep[]>(),
    bannerImage: text("bannerImage", { mode: "json" }).$type<string>(),
    tags: text("tags", { mode: "json" }).$type<RecipeTags[]>(),
    prep_time: integer("prep_time").default(0).notNull(),
    cook_time: integer("cook_time").default(0).notNull(),
});

export const foodItem = sqliteTable("foodItem", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    timestamp: integer("timestamp", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    food_id: integer("food_id")
        .notNull()
        .references(() => food.id),
    servings: integer("servings").notNull(),
    serving_mult: integer("serving_mult").notNull(),
    serving_type: text("serving_type", { length: 20 }).notNull(),
});
export const servingSize = sqliteTable("servingSize", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    serving_mult: integer("serving_mult").notNull(),
    serving_type: text("serving_type", { length: 20 }).notNull(),
    food_id: integer("food_id")
        .notNull()
        .references(() => food.id),
});

export const ingredientItem = sqliteTable("IngredientItem", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    recipe_id: integer("recipe_id")
        .notNull()
        .references(() => recipe.id),
    ingredient_id: integer("ingredient_id")
        .notNull()
        .references(() => food.id),
    prep_notes: text("prep_notes", { length: 250 }),
    display_name: text("display_name", { length: 20 }),
    servings: integer("servings").notNull(),
    serving_mult: integer("serving_mult").notNull(),
    serving_type: text("serving_type", { length: 20 }).notNull(),
});

export const nutritionGoal = sqliteTable("nutritionGoal", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    timestamp: text("timestamp")
        .notNull()
        .default(sql`(current_timestamp)`),
    protein: integer("protein").notNull().default(0),
    fat: integer("fat").notNull().default(0),
    calories: integer("calories").default(0).notNull(),
    carbs: integer("carbs").notNull().default(0),
});

export const macroSplit = sqliteTable("macroSplit", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 20 }).notNull(),
});

export const macroGoal = sqliteTable("macroGoal", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    protein: integer("protein").default(0).notNull(),
    fat: integer("fat").default(0).notNull(),
    carbs: integer("carbs").default(0).notNull(),
    calories: integer("calories").default(0).notNull(),
    macro_profile: integer("macro_profile")
        .notNull()
        .references(() => macroSplit.id),
});

export const recipeBook = sqliteTable("recipeBook", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 20 }).notNull(),
    pictures: text("pictures", { mode: "json" }).$type<string[]>(),
});
export const recipeBookItem = sqliteTable("recipeBookItem", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    recipe_id: integer("recipe_id")
        .notNull()
        .references(() => recipe.id),
    recipeBook_id: integer("recipeBook_id")
        .notNull()
        .references(() => recipeBook.id),
});

export const recipeBookRelations = relations(recipeBook, ({ many }) => ({
    items: many(recipeBookItem),
}));
export const recipeBookItemRelations = relations(recipeBookItem, ({ one }) => ({
    book: one(recipeBook, {
        fields: [recipeBookItem.recipeBook_id],
        references: [recipeBook.id],
    }),
}));
