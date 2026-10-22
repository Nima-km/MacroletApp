import Logo from "@/assets/svg/logo.svg";
import Plus from "@/assets/svg/plus-empty.svg";
import ArcChart from "@/components/chartComponents/MacroCharts/ArcChart";
import {
	SimpleChartCarbsGoal,
	SimpleChartFatGoal,
	SimpleChartProteinGoal,
} from "@/components/chartComponents/SimpleChart/SimpleChartGoal";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import WeightCard from "@/components/UIComponents/Cards/WeightCard";
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
import { foodFullDataList } from "@/tests/testData";
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
	// The weight query keys on `toISOString()`, which includes milliseconds. A range
	// built from `new Date()` therefore had a new identity on every render, so React
	// Query saw a brand-new query each time: fetch, render, new key, fetch again. That
	// loop is what put a pause in front of everything else on the JS thread - most
	// visibly the date selector, which rebuilds along with this screen.
	//
	// Anchoring the upper bound to midnight makes the key stable for the whole day
	// and still rolls over at midnight. The span is unchanged: eight days.
	const now = new Date();
	now.setHours(24, 0, 0, 0);
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
			<HeaderSimple
				dateSelector
				back={false}
				logo={<Logo width={50} height={50} />}
			/>
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
				<WeightCard
					data={WeightData}
					onOpenHistory={() =>
						router.push("/(tabs)/(Home)/weightHistory")
					}
					onLogWeight={() =>
						router.push("/(tabs)/(Home)/weightHistory")
					}
				/>
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
		gap: 30,
	},
	macroChartContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
});
