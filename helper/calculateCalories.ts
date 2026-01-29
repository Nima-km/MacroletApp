import { MacroType } from "@/types/food";



export function calculateCalories (food: Partial<MacroType>) {
    return (food.carbs ?? 0 + (food.protein ?? 0)) * 4 + (food.fat ?? 0)  * 9 - (food.fiber ?? 0) * 2
}