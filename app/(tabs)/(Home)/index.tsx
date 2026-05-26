import Plus from "@/assets/svg/plus-empty.svg";
import WeightLogChartSmall from "@/components/chartComponents/LogHistoryCharts/WeightLogChartSmall";
import ArcChart from "@/components/chartComponents/MacroCharts/ArcChart";
import {
	SimpleChartCarbsGoal,
	SimpleChartFatGoal,
	SimpleChartProteinGoal,
} from "@/components/chartComponents/SimpleChart/SimpleChartGoal";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H1, H2, H3, H5 } from "@/components/UIComponents/Typography";
import { useInsertFoodAndItem } from "@/db/hooks/food/useFood";
import { useInsertFoodItems } from "@/db/hooks/food/useFoodItem";
import { useGetNutriGoals } from "@/db/hooks/goals/nutritionGoal";
import { useGetFoodItemSum } from "@/db/hooks/history/foodItemhistory";
import { useGetWeightList } from "@/db/hooks/weight/useWeightLog";
import { calculateCalories } from "@/helper/calculateCalories";
import { useDateStore } from "@/store/dateStore";
import { generateMacroTestData } from "@/tests/generateTestData";
import { foodFullDataList, weightHistoryTestData } from "@/tests/testData";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const INTAKETESTDATA = generateMacroTestData({
	startDate: new Date("2026-05-01"),
	endDate: new Date("2026-05-20"),
	proteinRange: { min: 80, max: 160 },
	carbsRange: { min: 200, max: 300 },
	fatRange: { min: 50, max: 100 },
});
export default function Index() {
	const {
		mutate: logFoodItems,
		isPending: logFoodItemsPending,
		error: logFoodItemsError,
		isSuccess: logFoodItemsSuccess,
	} = useInsertFoodItems();
	const { mutate: logFoodAndItems } = useInsertFoodAndItem();
	const router = useRouter();
	const date = useDateStore((state) => state.date);
	const [newWeightLog, setNewWeightLog] = useState("");
	const now = new Date();
	now.setDate(now.getDate() + 1);
	const sevenDaysAgo = new Date(now);
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);
	const {
		data: WeightData,
		isLoading,
		error,
	} = useGetWeightList(sevenDaysAgo, now);
	const {
		data: LiveFood,
		isLoading: liveFoodLoading,
		error: liveFoodError,
	} = useGetFoodItemSum(
		new Date(date.getFullYear(), date.getMonth(), date.getDate()),
		new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24),
	);
	const {
		data: currentGoal,
		isLoading: currentGoalLoading,
		error: currentGoalError,
	} = useGetNutriGoals();

	useEffect(() => {
		const isAdd = false;
		/*if (isAdd) {
			console.log("adding test data");
			logFoodItems(INTAKETESTDATA, {
				onSuccess: () => {
					console.log("added successfully");
				},
			});
		}*/
		if (isAdd) {
			console.log("adding test data");
			foodFullDataList.map((item) => {
				return logFoodAndItems(
					{ foodData: item.food, foodItemData: item.foodItem },
					{
						onSuccess: () => {
							console.log("added successfully");
						},
					},
				);
			});
		}
	}, []);
	/*if (liveFoodLoading || currentGoalLoading) {
        return <H1>loading</H1>;
    }*/
	return (
		<KeyboardAware>
			<HeaderSimple title={"MACROLET"} dateSelector back={false} />
			<Pressable
				onPress={() => router.push("/(tabs)/(Home)/foodHistory")}
			>
				<View style={styles.chartContainer}>
					<H1>Calorie Intake</H1>
					<ArcChart
						targetPercentage={calculateCalories(currentGoal?.[0])}
						dailyProgress={calculateCalories(LiveFood?.[0])}
					/>
					<View style={styles.macroChartContainer}>
						<SimpleChartProteinGoal
							target={currentGoal?.[0]?.protein}
							progress={LiveFood?.[0].protein}
							backgroundColor={colors.off_white}
						/>
						<SimpleChartCarbsGoal
							target={currentGoal?.[0]?.carbs}
							progress={LiveFood?.[0].carbs}
							backgroundColor={colors.off_white}
						/>
						<SimpleChartFatGoal
							target={currentGoal?.[0]?.fat}
							progress={LiveFood?.[0].fat}
							backgroundColor={colors.off_white}
						/>
					</View>
				</View>
			</Pressable>
			<View style={{ padding: 20 }}>
				<Pressable
					onPress={() => router.push("/(tabs)/(Home)/weightHistory")}
				>
					<View
						style={{
							backgroundColor: colors.white,
							borderRadius: 8,
							padding: 20,
							gap: 20,
						}}
					>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
							}}
						>
							<H2>Weight</H2>
							<Plus
								color={colors.primary}
								height={25}
								width={25}
							/>
						</View>
						<View style={{ alignItems: "center" }}>
							<H3>Weekly Average</H3>
						</View>
						<H5>lbs</H5>
						<WeightLogChartSmall
							weightData={
								weightHistoryTestData //WeightData?.length == 0 ? undefined : WeightData
							}
						/>
					</View>
				</Pressable>
			</View>
		</KeyboardAware>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	chartContainer: {
		backgroundColor: colors.white,
		padding: 20,
	},
	macroChartContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
});
