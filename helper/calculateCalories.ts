import { MacroType } from "@/types/food";
import { SimpleRound } from "./simpleRound";

export function calculateCalories(food?: Partial<MacroType>) {
    console.log(
        "calculateCalories",
        (SimpleRound(food?.carbs ?? 0) + SimpleRound(food?.protein ?? 0)) * 4,
        SimpleRound(food?.fat ?? 0) * 9,
        SimpleRound(food?.fiber ?? 0) * 2,
    );
    return Math.round(
        (SimpleRound(food?.carbs ?? 0) + SimpleRound(food?.protein ?? 0)) * 4 +
            SimpleRound(food?.fat ?? 0) * 9 -
            SimpleRound(food?.fiber ?? 0) * 2,
    );
}
