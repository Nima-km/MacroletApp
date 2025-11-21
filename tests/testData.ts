import { FoodInsert, FoodItemInsert } from "@/types/food";
import { IngredientItemInsert, RecipeData } from "@/types/recipe";


export const TestFood1: FoodInsert = {
    name: "TESTFOOD1",
    nickname: "TESTFOOD1",
    protein: 1,
    fat: 1,
    carbs: 1,
    fiber: 0,
    barcode: 1,
    serving_100g: 1,
    volume_100ml: 1,
    micro_nutriants: {
        testmacro1: 12,
        testmacro2: 13,
    }
}

export const TestFood2: FoodInsert = {
    name: "TESTFOOD2",
    nickname: "TESTFOOD2",
    protein: 5,
    fat: 2,
    carbs: 10,
    fiber: 1,
    barcode: 2,
    serving_100g: 50,
    volume_100ml: 30,
    micro_nutriants: {
        testmacro1: 20,
        testmacro2: 21,
    }
};

export const TestFood3: FoodInsert = {
    name: "TESTFOOD3",
    nickname: "TESTFOOD3",
    protein: 12,
    fat: 4,
    carbs: 18,
    fiber: 2,
    barcode: 3,
    serving_100g: 100,
    volume_100ml: 80,
    micro_nutriants: {
        testmacro1: 30,
        testmacro2: 31,
    }
};

export const TestFood4: FoodInsert = {
    name: "TESTFOOD4",
    nickname: "TESTFOOD4",
    protein: 20,
    fat: 10,
    carbs: 25,
    fiber: 3,
    barcode: 4,
    serving_100g: 150,
    volume_100ml: 120,
    micro_nutriants: {
        testmacro1: 40,
        testmacro2: 41,
    }
};

export const TestFoodItem1: Omit<FoodItemInsert, 'food_id'> = {
    serving_type: "g",
    servings: 1,
    serving_mult: 1,
}
export const TestFoodItem2: Omit<FoodItemInsert, 'food_id'> = {
    serving_type: "g",
    servings: 1.5,
    serving_mult: 1,
}
export const TestFoodItem3: Omit<FoodItemInsert, 'food_id'> = {
    serving_type: "g",
    servings: 2,
    serving_mult: 1,
}
export const TestIngredientItem1: Omit<IngredientItemInsert, 'recipe_id'> = {
    serving_type: "g",
    ingredient_id: 1,
    servings: 1,
    serving_mult: 1,
}
export const TestIngredientItem2: Omit<IngredientItemInsert, 'recipe_id'> = {
    serving_type: "g",
    ingredient_id: 2,
    servings: 1,
    serving_mult: 1,
}
export const TestIngredientItem3: Omit<IngredientItemInsert, 'recipe_id'> = {
    serving_type: "g",
    ingredient_id: 3,
    servings: 1,
    serving_mult: 1,
}


export const TestRecipe1: RecipeData = {
    recipeData: {servings_yield: 2, },
    foodData: TestFood1,
    ingredientItemsData: [TestIngredientItem1, TestIngredientItem2]
}