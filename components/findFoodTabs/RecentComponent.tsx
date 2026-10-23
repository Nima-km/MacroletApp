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
import { colors } from "@/theme";
import { H1, H6 } from "../UIComponents/Typography";

interface FoodData {
	food: FoodInsert & { id: number };
	foodItem: FoodItemInsert;
}

interface RecentComponentProps {
	filteredData?: RecentFoodFullData[];
	onFoodCardID: (id: number) => void;
	onAddFood: (foodObject: FoodFullData) => void;
	/** Infinite scroll: only meaningful for a typed search. */
	onEndReached?: () => void;
	isFetchingNextPage?: boolean;
}

const RecentComponent = ({
	filteredData,
	onFoodCardID,
	onAddFood,
	onEndReached,
	isFetchingNextPage = false,
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
				// This list is the scroller now. It has to be for paging to mean
				// anything - scrollEnabled was false from when it sat inside a parent
				// ScrollView.
				onEndReached={onEndReached}
				onEndReachedThreshold={0.4}
				ListFooterComponent={
					isFetchingNextPage ? (
						<View style={{ paddingVertical: 16 }}>
							<H6
								style={{
									color: colors.inactive,
									textAlign: "center",
								}}
							>
								Loading more…
							</H6>
						</View>
					) : null
				}
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
