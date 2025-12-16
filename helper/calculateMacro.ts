import { MacroType } from "@/types/food";


export function calculateMacro (food: MacroType, mult: number) {
    return {carbs: food.carbs * mult, fat: food.fat * mult, protein: food.protein * mult, fiber: food.fiber * mult, calories: (food.calories ? food.calories * mult : food.calories)}
}