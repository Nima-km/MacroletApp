import { FoodItemDefault } from "@/tests/testData";
import {
	FoodFullData,
	FoodInsert,
	FoodItemInsert,
	RecentFoodFullData,
} from "@/types/food";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import FoodCardSmall from "../chartComponents/Cards/FoodCardSmall";
import SwipeableAdd from "../UIComponents/Swipeable/SwipeableAdd";
import { H1 } from "../UIComponents/Typography";

interface FoodData {
	food: FoodInsert & { id: number };
	foodItem: FoodItemInsert;
}

interface RecentComponentProps {
	filteredData?: RecentFoodFullData[];
	onFoodCardID: (id: number) => void;
	onAddFood: (foodObject: FoodFullData) => void;
}

const RecentComponent = ({
	filteredData,
	onFoodCardID,
	onAddFood,
}: RecentComponentProps) => {
	return (
		<View style={styles.container} /*showsVerticalScrollIndicator={false}*/>
			<H1 style={{ marginHorizontal: 20 }}>Recent </H1>
			<FlatList
				data={filteredData}
				renderItem={({ item }) => (
					<SwipeableAdd
						onSwipe={() =>
							onAddFood({
								food: item.food,
								foodItem: item.foodItem ?? FoodItemDefault,
							})
						}
					>
						<Pressable onPress={() => onFoodCardID(item.food.id)}>
							<FoodCardSmall
								food={item.food}
								foodItem={item.foodItem ?? FoodItemDefault}
							/>
						</Pressable>
					</SwipeableAdd>
				)}
				keyExtractor={(item) => item.food.id.toString()}
				scrollEnabled={false}
				ItemSeparatorComponent={() => <View style={{ padding: 6 }} />}
			/>
		</View>
	);
};

export default RecentComponent;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		//marginHorizontal: 20,
		gap: 8,
	},
});
