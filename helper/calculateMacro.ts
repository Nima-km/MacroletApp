import { MacroType } from "@/types/food";

/**
 * Scale a food's per-serving macros to the amount being logged.
 *
 * The parentheses matter: `food.carbs ?? 0 * mult` parses as
 * `food.carbs ?? (0 * mult)`, which drops the multiplier whenever the food has a
 * value - so every card showed one serving's macros regardless of the amount, while
 * the drawer totals (which scale correctly) disagreed with them.
 */
export function calculateMacro(food: Partial<MacroType>, mult: number) {
	return {
		carbs: (food.carbs ?? 0) * mult,
		fat: (food.fat ?? 0) * mult,
		protein: (food.protein ?? 0) * mult,
		fiber: (food.fiber ?? 0) * mult,
		calories: (food.calories ?? 0) * mult,
	};
}

export function macroSum(food: Partial<MacroType>) {
	return (food.carbs ?? 0) + (food.fat ?? 0) + (food.protein ?? 0);
}
