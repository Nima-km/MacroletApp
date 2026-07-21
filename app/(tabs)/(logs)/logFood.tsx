import FindFood from "@/components/findFoodTabs/FindFood";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { useInsertFoodItems } from "@/db/hooks/food/useFoodItem";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import { FoodFullData } from "@/types/food";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
	const [foodList, setFoodList] = useState<FoodFullData[]>([]);
	function onFoodCardID(food_id: number) {
		console.log("onFoodCardID id is", food_id);
		router.push({
			pathname: "/food",
			params: { food_id: food_id },
		});
	}
	const onLogFoodList = useCallback(() => {
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
	}, [foodList]);

	return (
		<KeyboardAware>
			<FindFood
				onFoodCardID={onFoodCardID}
				foodList={foodList}
				setFoodList={setFoodList}
				onLogFoodList={onLogFoodList}
			/>

			{/*BottomFoodList*/}
			{/*OnFood*/}
		</KeyboardAware>
	);
};

export default logFood;

const styles = StyleSheet.create({});
