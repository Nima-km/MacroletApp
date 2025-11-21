import { FoodType, MacroType } from "@/types/food";
import { IngredientItemType } from "@/types/recipe";



type IngredientFoodData = {
    ingredientItem: Omit<IngredientItemType, 'recipe_id'>,
    food: FoodType,
}
const Macro_sum = (a: MacroType, b: MacroType) => {
    const result = {protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, fiber: a.fiber + b.fiber}
    return result
}

export const CalculateMacroSum = (
    ingredientItemsData: Array<IngredientFoodData>
) => {
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