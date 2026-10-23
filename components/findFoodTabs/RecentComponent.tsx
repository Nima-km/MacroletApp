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
import { H1, H5, H6 } from "../UIComponents/Typography";

export interface FoodData {
	food: FoodInsert & { id: number };
	foodItem: FoodItemInsert;
}

/**
 * A row in the search/recent list.
 *
 * The list mixes things that aren't foods - a section label, a status line - so it
 * can show where each result came from. Before this, local and server results were
 * rendered by one list with no distinction, which is what made the search feel like
 * it was guessing.
 */
export type FoodListRow =
	| { kind: "header"; id: string; title: string }
	| { kind: "status"; id: string; text: string }
	| { kind: "food"; id: string; item: RecentFoodFullData };

interface RecentComponentProps {
	rows: FoodListRow[];
	/** Heading above the list: "Recent" when idle, "Search" when typing. */
	title: string;
	/** The whole row, because a server result needs saving before it has an id. */
	onSelect: (item: RecentFoodFullData) => void;
	onAddFood: (foodObject: FoodFullData) => void;
	/** Infinite scroll: only meaningful for a typed search. */
	onEndReached?: () => void;
	isFetchingNextPage?: boolean;
}

const RecentComponent = ({
	rows,
	title,
	onSelect,
	onAddFood,
	onEndReached,
	isFetchingNextPage = false,
}: RecentComponentProps) => {
	return (
		<View style={styles.container}>
			<H1 style={{ marginHorizontal: 20 }}>{title}</H1>
			<FlatList
				data={rows}
				renderItem={({ item }) => {
					if (item.kind === "header") {
						return (
							<H6 style={styles.sectionHeader}>{item.title}</H6>
						);
					}
					if (item.kind === "status") {
						return <H5 style={styles.status}>{item.text}</H5>;
					}
					return (
						<SwipeableAdd
							onSwipe={() =>
								onAddFood({
									food: item.item.food,
									foodItem:
										item.item.foodItem ?? FoodItemDefault,
								})
							}
						>
							<Pressable
								onPress={() => onSelect(item.item)}
							>
								<FoodCardSmall
									food={item.item.food}
									foodItem={
										item.item.foodItem ?? FoodItemDefault
									}
								/>
							</Pressable>
						</SwipeableAdd>
					);
				}}
				keyExtractor={(row) => row.id}
				// This list is the scroller now. It has to be for paging to mean
				// anything - scrollEnabled was false from when it sat inside a parent
				// ScrollView.
				onEndReached={onEndReached}
				style={{ paddingHorizontal: 20 }}
				onEndReachedThreshold={0.4}
				keyboardShouldPersistTaps="handled"
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
		gap: 8,
	},
	sectionHeader: {
		color: colors.inactive,
		marginHorizontal: 20,
		marginTop: 12,
		textTransform: "uppercase",
	},
	status: {
		color: colors.inactive,
		marginHorizontal: 20,
		marginVertical: 12,
	},
});
