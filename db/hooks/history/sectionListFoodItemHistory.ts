import { useMemo } from "react";
import { useGetFoodItemList } from "./foodItemhistory";

export const useFoodItemSectionList = (from: Date, to: Date) => {
    const { data: rawHistory, isLoading, error } = useGetFoodItemList(from, to);
    const timeSections = (start : number, stop: number, step: number) =>
        Array.from(
        { length: (stop - start) / step + 1 },
        (value, index) => start + index * step
    );

    const processed = useMemo(() => {
        if (!rawHistory) return [];

        return timeSections(rawHistory[0]?.foodItem.timestamp.getHours(), rawHistory[rawHistory.length - 1]?.foodItem.timestamp.getHours(), 5)
            .map((tmp) => {
              return {title: tmp, data: rawHistory
                .filter((item) => (item.foodItem.timestamp.getHours() >= tmp && item.foodItem.timestamp.getHours() < tmp + 5))}
          }).filter((item) => item.data.length > 0)
    }, [rawHistory]);
    
    return {
        data: processed,
        isLoading,
        error,
    };
};