import { FoodFullData } from "@/types/food";
import { IngredientFullData } from "@/types/recipe";
import { create } from "zustand";

type FoodBottomSheetStore = {
	foodFullData?: FoodFullData[];
	setFoodFullData?: (item: FoodFullData[]) => void;
};
type QuickMenu = {
	update: boolean;
	setUpdate: () => void;
};
type FindFoodSelectedPage = {
	selectedPage: number;
	setSelectedPage: (newPage: number) => void;
};
type IngredientBottomSheetStore = {
	foodFullData?: IngredientFullData[];
	setFoodFullData?: (item: IngredientFullData[]) => void;
};

export const useFoodBottomSheetStore = create<FoodBottomSheetStore>((set) => ({
	foodFullData: [],
	setFoodFullData: (newValue) => set({ foodFullData: newValue }),
}));
export const useFindFoodSelectedPageStore = create<FindFoodSelectedPage>(
	(set) => ({
		selectedPage: 0,
		setSelectedPage: (newPage) => set({ selectedPage: newPage }),
	}),
);
export const useQuickMenuStore = create<QuickMenu>((set) => ({
	update: false,
	setUpdate: () => set((state) => ({ update: !state.update })),
}));
export const useIngredientBottomSheetStore = create<IngredientBottomSheetStore>(
	(set) => ({
		foodFullData: [],
		setFoodFullData: (newValue) => set({ foodFullData: newValue }),
	}),
);
