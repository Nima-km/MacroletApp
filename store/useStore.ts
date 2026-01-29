import { FoodFullData } from '@/types/food';
import { IngredientFullData } from '@/types/recipe';
import { create } from 'zustand';


type FoodBottomSheetStore = {
    foodFullData?: FoodFullData[]
    setFoodFullData?: (item: FoodFullData[]) => void
}
type IngredientBottomSheetStore = {
    foodFullData?: IngredientFullData[]
    setFoodFullData?: (item: IngredientFullData[]) => void
}


export const useFoodBottomSheetStore = create<FoodBottomSheetStore>((set) => ({
    foodFullData: [],
    setFoodFullData: (newValue) => set({ foodFullData: newValue }),
}));
export const useIngredientBottomSheetStore = create<IngredientBottomSheetStore>((set) => ({
    foodFullData: [],
    setFoodFullData: (newValue) => set({ foodFullData: newValue }),
}));