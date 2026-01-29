import { MacroType } from "@/types/food";


export function calculateMacro (food: MacroType, mult: number) {
    return {carbs: food.carbs * mult, fat: food.fat * mult, protein: food.protein * mult, fiber: food.fiber * mult, calories: (food.calories ? food.calories * mult : food.calories)}
}

export function macroSum(food: Partial<MacroType>) {
    return ((food.carbs ?? 0) + (food.fat ?? 0) + (food.protein ?? 0))
}