import { MacroType } from "@/types/food";



export function calculateCalories (food: MacroType) {
    return (food.carbs + food.protein) * 4 + food.fat * 9 - food.fiber * 2
}