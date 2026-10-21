import FoodSVG from "@/assets/svg/foods.svg";
import FoodCardFull from "@/components/chartComponents/Cards/FoodCardFull";
import MyBarChart from "@/components/chartComponents/MacroCharts/MyBarChart";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import SwipeableDelete from "@/components/UIComponents/Swipeable/SwipeableDelete";
import { H1, H4 } from "@/components/UIComponents/Typography";
import { getFoodItemHistory } from "@/db/queries/history";
import { useDeleteFoodItem } from "@/db/hooks/food/useFoodItem";
import { useGetNutriGoals } from "@/db/hooks/goals/nutritionGoal";
import { useGetFoodItemSum } from "@/db/hooks/history/foodItemhistory";
import { useFoodItemSectionList } from "@/db/hooks/history/sectionListFoodItemHistory";
import { calculateCalories } from "@/helper/calculateCalories";
import { formatAMPM } from "@/helper/formatTime";
import { SimpleRound } from "@/helper/simpleRound";
import { useDateStore } from "@/store/dateStore";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";

type LogRowProps = {
	item: Awaited<ReturnType<typeof getFoodItemHistory>>[number];
	onDelete: (foodItemId: number) => void;
	onPressCard: (foodId: number, foodItemId: number) => void;
};

/**
 * One logged row. Extracted and memoised so the SectionList can skip rows whose item
 * and handlers are unchanged - otherwise every render rebuilt the SwipeableDelete's
 * children, which defeats its memo and re-renders a ReanimatedSwipeable's worth of
 * gesture handlers per row.
 */
const LogRow = memo(function LogRow({
	item,
	onDelete,
	onPressCard,
}: LogRowProps) {
	return (
		<View style={{ paddingVertical: 10, paddingHorizontal: 20 }}>
			<SwipeableDelete onPress={() => onDelete(item.foodItem.id)}>
				<Pressable
					onPress={() => onPressCard(item.food.id, item.foodItem.id)}
				>
					<FoodCardFull food={item.food} foodItem={item.foodItem} />
				</Pressable>
			</SwipeableDelete>
		</View>
	);
});

const logs = () => {
	const date = useDateStore((state) => state.date);
	const router = useRouter();
	const {
		data: nutriGoals,
		isLoading: loadingGoal,
		error: errorGoal,
	} = useGetNutriGoals();
	const {
		data: LiveFood,
		isLoading: liveFoodLoading,
		error: liveFoodError,
	} = useGetFoodItemSum(
		new Date(date.getFullYear(), date.getMonth(), date.getDate()),
		new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24),
	);
	const {
		data: slData,
		isLoading: loadingSectionList,
		error: errorSectionList,
	} = useFoodItemSectionList(
		new Date(date.getFullYear(), date.getMonth(), date.getDate()),
		new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24),
	);
	const { mutate: deleteFoodItem } = useDeleteFoodItem();
	const onDelete = useCallback(
		(foodItem_id: number) => {
			deleteFoodItem(foodItem_id, {
				onSuccess: (item) => {
					console.log(`Removed from history`);
				},
				onError: (item) => {
					console.log(`Something Went Wrong`, item);
				},
			});
		},
		[deleteFoodItem],
	);
	const onPressCard = useCallback(
		(food_id: number, foodItem_id: number) => {
			console.log("onFoodCardID id is", food_id);
			router.push({
				pathname: "/foodItem",
				params: { food_id, foodItem_id },
			});
		},
		[router],
	);
	const renderItem = useCallback(
		({
			item,
		}: {
			item: Awaited<ReturnType<typeof getFoodItemHistory>>[number];
		}) => (
			<LogRow item={item} onDelete={onDelete} onPressCard={onPressCard} />
		),
		[onDelete, onPressCard],
	);

	// Stable identity so the memoised MyBarChart isn't invalidated by a parent render.
	const chartGoal = useMemo(
		() => ({
			fiber: 0,
			calories: calculateCalories(nutriGoals?.[0]),
			protein: nutriGoals?.[0]?.protein ?? 0,
			carbs: nutriGoals?.[0]?.carbs ?? 0,
			fat: nutriGoals?.[0]?.fat ?? 0,
		}),
		[nutriGoals],
	);

	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple title="LOGS" dateSelector back={false} />
			<SectionList
				// One scroller: the SectionList itself. Nested in a ScrollView it never
				// virtualised, so switching to a day with rows mounted every row - each a
				// ReanimatedSwipeable - which is what stalled the whole screen, date text
				// included, for a couple of seconds.
				ListHeaderComponent={
					<View
						style={{
							backgroundColor: colors.white,
							padding: 20,
							gap: 20,
						}}
					>
						<H1>Calorie Intake</H1>
						<MyBarChart goal={chartGoal} progress={LiveFood?.[0]} />
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								paddingHorizontal: 20,
							}}
						>
							<View
								style={{ justifyContent: "flex-end", gap: 20 }}
							>
								<View
									style={{
										flexDirection: "row",
										gap: 16,
									}}
								>
									<View
										style={{
											backgroundColor: colors.protein,
											width: 10,
											borderRadius: 8,
										}}
									/>
									<H4>PROTEIN</H4>
								</View>
								<View
									style={{
										flexDirection: "row",
										gap: 16,
									}}
								>
									<View
										style={{
											backgroundColor: colors.carbs,
											width: 10,
											borderRadius: 8,
										}}
									/>
									<H4>CARBS</H4>
								</View>
								<View
									style={{
										flexDirection: "row",
										gap: 16,
									}}
								>
									<View
										style={{
											backgroundColor: colors.fat,
											width: 10,
											borderRadius: 8,
										}}
									/>
									<H4>FAT</H4>
								</View>
							</View>
							<View
								style={{ justifyContent: "flex-end", gap: 20 }}
							>
								<H4>TOTAL</H4>
								<H4>
									{SimpleRound(LiveFood?.[0]?.protein ?? 0)} g
								</H4>
								<H4>
									{SimpleRound(LiveFood?.[0]?.carbs ?? 0)} g
								</H4>
								<H4>
									{SimpleRound(LiveFood?.[0]?.fat ?? 0)} g
								</H4>
							</View>
							<View
								style={{ justifyContent: "flex-end", gap: 20 }}
							>
								<H4>GOAL</H4>
								<H4>
									{SimpleRound(nutriGoals?.[0]?.protein ?? 0)}{" "}
									g
								</H4>
								<H4>
									{SimpleRound(nutriGoals?.[0]?.carbs ?? 0)} g
								</H4>
								<H4>
									{SimpleRound(nutriGoals?.[0]?.fat ?? 0)} g
								</H4>
							</View>
						</View>
					</View>
				}
				contentContainerStyle={{
					paddingBottom: 40,
					//paddingHorizontal: 20,
				}}
				sections={slData}
				renderItem={renderItem}
				// Keep fewer rows alive. Every mounted row is a ReanimatedSwipeable - two
				// native gesture handlers in the touch path - so the count is what costs,
				// not any single row.
				initialNumToRender={3}
				maxToRenderPerBatch={6}
				windowSize={3}
				// flex:1 bounds the list to the screen. Without it a list has no implicit
				// height and its frame grows to its content - nothing to scroll.
				style={[{ flex: 1, paddingTop: 30, paddingBottom: 12 }]}
				keyExtractor={(item) => item.foodItem.id.toString()}
				renderSectionHeader={({ section: { title } }) => (
					<View
						style={[
							{
								alignItems: "center",
								flexDirection: "row",
								paddingVertical: 12,
								paddingHorizontal: 20,
							},
						]}
					>
						<H4>{formatAMPM(title)}</H4>
						<View
							style={{
								backgroundColor: colors.light_gray,
								height: 1,
								flex: 1,
								marginLeft: 20,
							}}
						/>
					</View>
				)}
				ListFooterComponent={
					<View style={{ paddingHorizontal: 20 }}>
						{slData.length == 0 && (
							<View
								style={{
									justifyContent: "center",
									alignItems: "center",
									marginBottom: 20,
								}}
							>
								<FoodSVG height={110} width={110} style={{}} />
								<View
									style={{
										justifyContent: "center",
										alignItems: "center",
										marginTop: 14,
									}}
								>
									<H4 style={[{ color: colors.inactive }]}>
										No meals logged yet.
									</H4>
									<H4
										style={[
											{
												color: colors.inactive,
												marginTop: 4,
											},
										]}
									>
										Add your first meal here!
									</H4>
								</View>
							</View>
						)}
						<PrimaryButton
							onPress={() =>
								router.push("/(tabs)/(logs)/logFood")
							}
						>
							+ Add
						</PrimaryButton>
					</View>
				}
			/>
		</View>
	);
};

export default logs;

const styles = StyleSheet.create({});
