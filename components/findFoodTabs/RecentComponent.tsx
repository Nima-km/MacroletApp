import { FoodItemDefault } from "@/tests/testData";
import {
	FoodFullData,
	FoodInsert,
	FoodItemInsert,
	RecentFoodFullData,
} from "@/types/food";
import { useFoodSelectionStore } from "@/store/foodSelectionStore";
import React, { memo, useCallback, useMemo } from "react";
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
	| {
			kind: "food";
			id: string;
			item: RecentFoodFullData;
			/** Came from the local database, not the server. */
			isLocal: boolean;
	  };

/**
 * One food row.
 *
 * Memoised, and given primitives plus stable handlers, so adding an item re-renders
 * only the row whose count changed - not every visible row. The swipe handler here is
 * built from props, not from a closure over the list, which is what let the old
 * inline `onSwipe` defeat `SwipeableAdd`'s memo on every render.
 */
const FoodRow = memo(function FoodRow({
	item,
	selectedCount,
	onAdd,
	onSelect,
	isLocal,
}: {
	item: RecentFoodFullData;
	selectedCount: number;
	onAdd: (food: FoodFullData) => void;
	onSelect: (food: RecentFoodFullData, isLocal: boolean) => void;
	/** Server rows look positive-id'd too, so provenance has to travel with the row. */
	isLocal: boolean;
}) {
	const handleSwipe = useCallback(
		() =>
			onAdd({
				food: item.food,
				foodItem: item.foodItem ?? FoodItemDefault,
			}),
		[onAdd, item],
	);
	const handlePress = useCallback(
		() => onSelect(item, isLocal),
		[onSelect, item, isLocal],
	);

	return (
		<SwipeableAdd onSwipe={handleSwipe}>
			<Pressable onPress={handlePress}>
				<FoodCardSmall
					food={item.food}
					foodItem={item.foodItem ?? FoodItemDefault}
					selectedCount={selectedCount}
				/>
			</Pressable>
		</SwipeableAdd>
	);
});

interface RecentComponentProps {
	rows: FoodListRow[];
	/** Heading above the list: "Recent" when idle, "Search" when typing. */
	title: string;
	/** The whole row, because a server result needs saving before it has an id. */
	onSelect: (item: RecentFoodFullData, isLocal: boolean) => void;
	onAddFood: (foodObject: FoodFullData) => void;
	/** Infinite scroll: only meaningful for a typed search. */
	onEndReached?: () => void;
	isFetchingNextPage?: boolean;
	/** True when this list fills a recipe's ingredients rather than a meal. */
	ingredientMode?: boolean;
}

const RecentComponent = ({
	rows,
	title,
	onSelect,
	onAddFood,
	onEndReached,
	isFetchingNextPage = false,
	ingredientMode = false,
}: RecentComponentProps) => {
	// Subscribed here rather than in the parent: the counts only affect this list, and
	// a parent subscription made the whole screen (pager and tabs included) re-render
	// on every swipe.
	const foodCart = useFoodSelectionStore((state) => state.foodList);
	const ingredientCart = useFoodSelectionStore((state) => state.ingredientList);
	const selectedCounts = useMemo(() => {
		const counts = new Map<number, number>();
		const items = ingredientMode ? ingredientCart : foodCart;
		items.forEach((item) => {
			const id = item.food?.id;
			if (typeof id === "number") {
				counts.set(id, (counts.get(id) ?? 0) + 1);
			}
		});
		return counts;
	}, [foodCart, ingredientCart, ingredientMode]);
	return (
		<View style={styles.container}>
			<H1 style={{ marginHorizontal: 20 }}>{title}</H1>
			<FlatList
				data={rows}
				// A stable renderer plus extraData: a count change reaches the cells
				// without the list rebuilding every row's handler.
				extraData={selectedCounts}
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
						<FoodRow
							item={item.item}
							isLocal={item.isLocal}
							selectedCount={
								selectedCounts?.get(item.item.food.id) ?? 0
							}
							onAdd={onAddFood}
							onSelect={onSelect}
						/>
					);
				}}
				keyExtractor={(row) => row.id}
				// Clear the bottom tab bar and the collapsed selection drawer, or the
				// last row sits underneath them with nothing left to scroll.
				contentContainerStyle={{ paddingBottom: 160 }}
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
