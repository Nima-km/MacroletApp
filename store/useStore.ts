import { FoodFullData } from '@/types/food';
import { create } from 'zustand';

// Define the store
type CounterStore = {
    value: number;
    setValue: (newValue: number) => void;
};

type FoodBottomSheetStore = {
    foodFullData?: FoodFullData[]
    setFoodFullData?: (item: FoodFullData[]) => void
}


export const useCounterStore = create<CounterStore>((set) => ({
    value: 0,
    setValue: (newValue) => set({ value: newValue }),
}));


export const useFoodBottomSheetStore = create<FoodBottomSheetStore>((set) => ({
    foodFullData: [],
    setFoodFullData: (newValue) => set({ foodFullData: newValue }),
}));