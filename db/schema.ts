import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';


export const food = sqliteTable('food', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
    nickname: text('nickname').notNull(),
    // Macronutrients per 100g (or standard unit)
    protein: integer('protein').default(0).notNull(),
    fat: integer('fat').default(0).notNull(),
    carbs: integer('carbs').default(0).notNull(),
    fiber: integer('fiber').default(0).notNull(),
    barcode: integer('barcode').default(0),
    
    serving_100g: integer('serving_100g').default(1).notNull(),
    volume_100ml: integer('volume_100ml').default(1).notNull(),
    micro_nutriants: text('micro_nutriants', { mode: 'json' }),
    is_recipe: integer('is_recipe', {mode: 'boolean'}).default(false).notNull(),
  
    recipe_id: integer('recipe_id')
    .references(() => recipe.id),
})
export const recipe = sqliteTable('recipe', {
    id: integer('id').primaryKey({autoIncrement: true}),
    servings_yield: integer('servings_yield').default(0).notNull(),
    directions: text('directions', { mode: 'json' }),
    prep_time: integer('prep_time').default(0).notNull(),
    cook_time: integer('cook_time').default(0).notNull(),
    
})

export const foodItem = sqliteTable ('foodItem', {
    id: integer('id').primaryKey({autoIncrement: true}),
    timestamp: integer('timestamp', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
    food_id: integer('food_id')
    .notNull()
    .references(() => food.id),
    servings: integer('servings').default(0).notNull(),
    serving_mult: integer('serving_mult').default(1).notNull(),
    serving_type: text('serving_type').notNull(),
    
}
)

export const IngredientItem = sqliteTable ('IngredientItem', {
    id: integer('id').primaryKey({autoIncrement: true}),
    recipe_id: integer('recipe_id')
    .notNull()
    .references(() => recipe.id),
    ingredient_id: integer('food_id')
    .notNull()
    .references(() => food.id),
    servings: integer('servings').notNull(),
    serving_mult: integer('serving_mult').default(1).notNull(),
    serving_type: text('serving_type').notNull(),
    
}
)

export const nutritionGoal = sqliteTable('nutritionGoal', {
    id: integer('id').primaryKey({autoIncrement: true}),
    timestamp: text('timestamp')
    .notNull()
    .default(sql`(current_timestamp)`),
    protein: integer('protein').notNull().default(0),
    fat: integer('fat').notNull().default(0),
    calories: integer('calories').default(0).notNull(),
    carbs: integer('carbs').notNull().default(0),
    
})

export const macroSplit = sqliteTable('macroSplit', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
})

export const macroGoal = sqliteTable('macroGoal', {
    id: integer('id').primaryKey({autoIncrement: true}),
    protein: integer('protein').default(0).notNull(),
    fat: integer('fat').default(0).notNull(),
    carbs: integer('carbs').default(0).notNull(),
    calories: integer('calories').default(0).notNull(),
    macro_profile: integer('macro_profile')
    .notNull()
    .references(() => macroSplit.id),
})


export const recipeBook = sqliteTable('recipeBook', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name').notNull(),
    pictures: text('pictures', { mode: 'json' }),
})
export const recipeBookItem = sqliteTable ('recipeBookItem', {
    id: integer('id').primaryKey({autoIncrement: true}),
    recipe_id: integer('recipe_id')
    .notNull()
    .references(() => recipe.id),
    recipeBook_id: integer('recipeBook_id')
    .notNull()
    .references(() => recipeBook.id),
}
)