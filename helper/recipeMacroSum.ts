import { FoodFullData, FoodType, MacroType } from "@/types/food";
import { IngredientFullData, IngredientItemType } from "@/types/recipe";



type IngredientFoodData = {
    ingredientItem: Omit<IngredientItemType, 'recipe_id'>,
    food: FoodType,
}
const Macro_sum = (a: MacroType, b: MacroType) => {
    const result = {protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, fiber: a.fiber + b.fiber}
    return result
}

export const CalculateMacroSumIngredient = (
    ingredientItemsData?: Array<IngredientFullData>
) => {
    if (ingredientItemsData == undefined || ingredientItemsData.length === 0) {
        return {protein: 0, carbs: 0, fat: 0, fiber: 0}
    }
    const macros = ingredientItemsData.map((item) => {
        return  (
            {
                protein: item.food.protein * item.ingredientItem.serving_mult * item.ingredientItem.servings,
                carbs: item.food.carbs * item.ingredientItem.serving_mult * item.ingredientItem.servings,
                fiber: item.food.fiber * item.ingredientItem.serving_mult * item.ingredientItem.servings,
                fat: item.food.fat * item.ingredientItem.serving_mult * item.ingredientItem.servings,
            }
        )
    })
    const total_macros = macros.reduce((a, b) => Macro_sum(a, b))
    return total_macros
}
export const CalculateMacroSum = (
    foodItemsData?: Array<FoodFullData>
) => {
    if (foodItemsData == undefined || foodItemsData.length === 0) {
        return {protein: 0, carbs: 0, fat: 0, fiber: 0}
    }
    const macros = foodItemsData.map((item) => {
        return  (
            {
                protein: item.food.protein * item.foodItem.serving_mult * item.foodItem.servings,
                carbs: item.food.carbs * item.foodItem.serving_mult * item.foodItem.servings,
                fiber: item.food.fiber * item.foodItem.serving_mult * item.foodItem.servings,
                fat: item.food.fat * item.foodItem.serving_mult * item.foodItem.servings,
            }
        )
    })
    const total_macros = macros.reduce((a, b) => Macro_sum(a, b), {protein: 0, carbs: 0, fat: 0, fiber: 0})
    return total_macros
}