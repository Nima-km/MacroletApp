import { FoodFullData } from "@/types/food";
import { IngredientFullData } from "@/types/recipe";
import { create } from "zustand";

/**
 * The items picked in FindFood, before they are committed.
 *
 * These lived as `useState` in each of the three screens that render `FindFood`
 * (log a food, add a recipe ingredient, modify a recipe ingredient) and were passed
 * down as props. Because the state sat at the screen root, one swipe in the recent
 * tab re-rendered the entire screen - the PagerView, every mounted recent row (each
 * with a macro chart), and the bottom sheet - which is what made that gesture drop
 * frames.
 *
 * Now only the two things that actually display the selection subscribe:
 * `FoodSelectionSheets`, and the screens read it imperatively via `getState()` when
 * they commit. Everything else stays still.
 *
 * Two slices rather than one, because the two flows hold different data: a logged
 * food is a `FoodFullData`, a recipe ingredient is `{ food, ingredientItem }`.
 */
type FoodSelectionState = {
	foodList: FoodFullData[];
	ingredientList: IngredientFullData[];

	addFood: (item: FoodFullData) => void;
	removeFood: (index: number) => void;
	clearFood: () => void;

	addIngredient: (item: IngredientFullData) => void;
	removeIngredient: (index: number) => void;
	clearIngredient: () => void;
};

export const useFoodSelectionStore = create<FoodSelectionState>((set) => ({
	foodList: [],
	ingredientList: [],

	addFood: (item) => set((state) => ({ foodList: [...state.foodList, item] })),
	removeFood: (index) =>
		set((state) => ({
			foodList: state.foodList.filter((_, i) => i !== index),
		})),
	clearFood: () => set({ foodList: [] }),

	addIngredient: (item) =>
		set((state) => ({
			ingredientList: [...state.ingredientList, item],
		})),
	removeIngredient: (index) =>
		set((state) => ({
			ingredientList: state.ingredientList.filter((_, i) => i !== index),
		})),
	clearIngredient: () => set({ ingredientList: [] }),
}));
