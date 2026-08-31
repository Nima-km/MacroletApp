import { MacroType } from "@/types/food";

export function calculateMacro(food: Partial<MacroType>, mult: number) {
	return {
		carbs: food.carbs ?? 0 * mult,
		fat: food.fat ?? 0 * mult,
		protein: food.protein ?? 0 * mult,
		fiber: food.fiber ?? 0 * mult,
		calories: food.calories ? food.calories * mult : food.calories,
	};
}

export function macroSum(food: Partial<MacroType>) {
	return (food.carbs ?? 0) + (food.fat ?? 0) + (food.protein ?? 0);
}
