import FindFood from "@/components/findFoodTabs/FindFood";
import KeyboardAvoider from "@/components/UIComponents/KeyboardAware/KeyboardAvoider";
import { useInsertFoodItems } from "@/db/hooks/food/useFoodItem";
import { useFoodSelectionStore } from "@/store/foodSelectionStore";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";

const logFood = () => {
	const {
		mutate: logFoodItems,
		isPending: logFoodItemsPending,
		error: logFoodItemsError,
		isSuccess: logFoodItemsSuccess,
	} = useInsertFoodItems();
	const router = useRouter();
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const clearFood = useFoodSelectionStore((s) => s.clearFood);
	// The selection lives in a store now, so clear it on mount - otherwise items
	// picked during a previous visit would still be waiting here.
	useEffect(() => {
		clearFood();
	}, [clearFood]);
	function onFoodCardID(food_id: number) {
		console.log("onFoodCardID id is", food_id);
		router.push({
			pathname: "/food",
			params: { food_id: food_id },
		});
	}
	const onLogFoodList = useCallback(() => {
		// Read imperatively: this screen only commits the selection, it never
		// displays it, so subscribing would re-render it for nothing.
		const { foodList } = useFoodSelectionStore.getState();
		const toLog = foodList.map((item) => {
			return {
				...item.foodItem,
				food_id: item.food.id,
				timestamp: new Date(),
				id: undefined,
			};
		});
		console.log("FoodFullData", foodList);
		logFoodItems(toLog, {
			onSuccess: () => {
				console.log("great successs on Log ALl");
				router.back();
			},
			onError: (e) => {
				console.log("error on Log ALl", e);
			},
		});
	}, [logFoodItems, router]);

	return (
		<KeyboardAvoider>
			<FindFood
				onFoodCardID={onFoodCardID}
				onLogFoodList={onLogFoodList}
			/>

			{/*BottomFoodList*/}
			{/*OnFood*/}
		</KeyboardAvoider>
	);
};

export default logFood;

const styles = StyleSheet.create({});
