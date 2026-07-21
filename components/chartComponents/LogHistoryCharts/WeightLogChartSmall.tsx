import { bigRound } from "@/helper/bigRound";
import { colors, typography } from "@/theme";
import { WeightHistoryRecord, WeightType } from "@/types/weight";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CurveType, LineChart } from "react-native-gifted-charts";

interface Props {
	weightData?: WeightHistoryRecord[];
	onSelect?: (item: WeightHistoryRecord) => void;
}
const formatWeightForChart = (
	weightData: WeightType[],
	//  onSelect: (item: WeightType) => void,
) => {
	return weightData.map((item) => ({
		value: item.weight,
		label:
			(item.timestamp.getMonth() + 1).toString() +
			"/" +
			(item.timestamp.getDate() + 1).toString(),
	}));
};
const calculateStepValue = (
	a?: WeightHistoryRecord,
	b?: WeightHistoryRecord,
) => {
	if (a && b) {
		const res = Math.ceil(Math.max(a.weight - b.weight, 5) / 3 / 5) * 5;
		return res;
	}
	return 5;
};
const WeightLogChartSmall = ({ weightData, onSelect }: Props) => {
	const lineData = weightData
		? formatWeightForChart(weightData).slice(0, 7)
		: [];
	const customDataPoint = () => {
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

	const minWeight = weightData?.reduce((a, b) =>
		a.weight < b.weight || b.weight == 0 ? a : b,
	);
	const maxWeight = weightData?.reduce((a, b) =>
		a.weight > b.weight ? a : b,
	);
	return (
		<View style={{}}>
			<LineChart
				data={lineData}
				curved
				mostNegativeValue={0}
				curveType={CurveType.CUBIC}
				stepValue={calculateStepValue(maxWeight, minWeight)}
				dashGap={0}
				showFractionalValues={false}
				width={275}
				height={120}
				color={colors.primary}
				customDataPoint={customDataPoint}
				yAxisTextStyle={[typography.h6, { color: colors.black }]}
				yAxisLabelContainerStyle={{
					width: 30,
					marginRight: 5,
					//  justifyContent: "flex-end",
				}}
				yAxisLabelWidth={30}
				initialSpacing={30}
				dataPointsHeight={12}
				dataPointsWidth={12}
				thickness={3}
				spacing={41}
				disableScroll
				yAxisThickness={0}
				xAxisColor={colors.light_gray}
				yAxisOffset={Math.max(bigRound(minWeight?.weight, 5) - 10, 0)}
				maxValue={Math.max(
					20,
					bigRound(maxWeight?.weight, 5) -
						bigRound(minWeight?.weight, 5) +
						20,
				)}
			/>
		</View>
	);
};

export default WeightLogChartSmall;

const styles = StyleSheet.create({});
