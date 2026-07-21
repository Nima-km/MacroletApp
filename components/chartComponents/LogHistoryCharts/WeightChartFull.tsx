import { H5, H6 } from "@/components/UIComponents/Typography";
import { bigRound } from "@/helper/bigRound";
import { colors, typography } from "@/theme";
import { nutritionGoalGet } from "@/types/goals";
import { WeightHistoryRecord, WeightType } from "@/types/weight";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CurveType, LineChart } from "react-native-gifted-charts";
interface Props {
	weightData?: WeightHistoryRecord[];
	showWeight?: boolean;
	goal?: nutritionGoalGet;
	onSelect: (item: WeightType) => void;
}
const customDataPoint = (item: WeightType) => {
	return (
		<View
			style={{
				width: 12,
				height: 12,
				backgroundColor: "white",
				borderWidth: 3,
				borderRadius: 10,
				borderColor: colors.primary,
			}}
		/>
	);
};

const formatWeightForChart = (
	weightData: WeightHistoryRecord[],
	onSelect: (item: WeightType) => void,
) => {
	return weightData.map((item) => ({
		value: item.weight,
		label:
			(item.timestamp.getMonth() + 1).toString() +
			"/" +
			(item.timestamp.getDate() + 1).toString(),
		customDataPoint: () => customDataPoint(item),
		dataPointLabelComponent: () => (
			<H6 style={{ textAlign: "center" }}>{item.weight}</H6>
		),
	}));
};
const calculateStepValue = (
	a?: WeightHistoryRecord,
	b?: WeightHistoryRecord,
) => {
	if (a && b) {
		const res = Math.ceil(Math.max(a.weight - b.weight, 5) / 7 / 5) * 5;
		return res;
	}
	return 5;
};
const WeightChartFull = ({ weightData, goal, showWeight, onSelect }: Props) => {
	const lineData = weightData
		? formatWeightForChart(weightData, onSelect)
		: undefined;
	const minWeight = weightData?.reduce((a, b) =>
		a.weight < b.weight || b.weight == 0 ? a : b,
	);
	const maxWeight = weightData?.reduce((a, b) =>
		a.weight > b.weight ? a : b,
	);
	console.log("minWeight", minWeight);
	console.log("maxWeight", maxWeight);
	console.log(
		"biground",
		bigRound(maxWeight?.weight, 5) - bigRound(minWeight?.weight, 5),
	);
	return (
		<View style={{}}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<H5
					style={{
						width: 31,
					}}
				>
					lbs
				</H5>
			</View>

			<LineChart
				data={lineData}
				curved
				curveType={CurveType.CUBIC}
				stepValue={calculateStepValue(maxWeight, minWeight)}
				showFractionalValues={false}
				dashGap={0}
				width={290}
				color={colors.primary}
				focusEnabled
				yAxisTextStyle={[typography.h6, { color: colors.black }]}
				yAxisLabelContainerStyle={{
					width: 28,
					marginRight: 5,
					//  justifyContent: "flex-end",
				}}
				yAxisLabelWidth={30}
				initialSpacing={30}
				dataPointsHeight={12}
				dataPointsWidth={12}
				dataPointLabelWidth={31}
				dataPointLabelShiftY={-20}
				thickness={3}
				spacing={41}
				yAxisThickness={0}
				xAxisColor={colors.light_gray}
				yAxisOffset={Math.max(bigRound(minWeight?.weight, 5) - 10, 0)}
				maxValue={Math.max(
					20,
					bigRound(maxWeight?.weight, 5) -
						bigRound(minWeight?.weight, 5) +
						20,
				)}
				scrollToEnd
			/>
		</View>
	);
};

export default WeightChartFull;

const styles = StyleSheet.create({});
