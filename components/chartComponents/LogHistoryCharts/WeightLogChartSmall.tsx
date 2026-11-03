import { bigRound } from "@/helper/bigRound";
import {
	axisMinSpan,
	axisPadding,
	axisStep,
	toDisplay,
} from "@/helper/units";
import { emaTrend } from "@/helper/weightTrend";
import { useUnitStore } from "@/store/unitStore";
import { colors, typography } from "@/theme";
import { WeightType } from "@/types/weight";
import type { WeightPoint } from "@/helper/weightTrend";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CurveType, LineChart } from "react-native-gifted-charts";

interface Props {
	weightData?: WeightPoint[];
	onSelect?: (item: WeightPoint) => void;
}
const formatWeightForChart = (
	weightData: WeightPoint[],
	//  onSelect: (item: WeightType) => void,
) => {
	return weightData.map((item) => ({
		value: item.weight,
		// getDate() is already 1-based - the old +1 rendered every label a day late.
		label:
			(item.timestamp.getMonth() + 1).toString() +
			"/" +
			item.timestamp.getDate().toString(),
	}));
};
const calculateStepValue = (
	a: WeightPoint | undefined,
	b: WeightPoint | undefined,
	step: number,
) => {
	if (a && b) {
		return Math.ceil(Math.max(a.weight - b.weight, step) / 3 / step) * step;
	}
	return step;
};
const WeightLogChartSmall = ({ weightData, onSelect }: Props) => {
	const unit = useUnitStore((state) => state.unit);
	const step = axisStep(unit);
	const pad = axisPadding(unit);
	const minSpan = axisMinSpan(unit);

	// Stored grams -> display unit once; the sparkline's constants are unit-dependent.
	const display = weightData?.map((record) => ({
		...record,
		weight: toDisplay(record.weight, unit),
	}));

	const lineData = display
		// The newest seven, not the oldest: the query returns ascending order.
		? formatWeightForChart(display).slice(-7)
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

	const minWeight = display?.reduce((a, b) =>
		a.weight < b.weight || b.weight == 0 ? a : b,
	);
	const maxWeight = display?.reduce((a, b) =>
		a.weight > b.weight ? a : b,
	);
	const trendData = display
		? emaTrend(display)
				.slice(-7)
				.map((point) => ({ value: point.trend }))
		: undefined;

	return (
		<View style={{}}>
			<LineChart
				data={lineData}
				curved
				mostNegativeValue={0}
				curveType={CurveType.CUBIC}
				stepValue={calculateStepValue(maxWeight, minWeight, step)}
				dashGap={0}
				showFractionalValues={false}
				width={275}
				height={120}
				// The readings are the data; the trend is an annotation on top of them.
				color={colors.primary}
				data2={trendData}
				color2={colors.inactive}
				thickness2={2}
				strokeDashArray2={[5, 4]}
				hideDataPoints2
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
				yAxisOffset={Math.max(bigRound(minWeight?.weight, step) - pad, 0)}
				maxValue={Math.max(
					minSpan,
					bigRound(maxWeight?.weight, step) -
						bigRound(minWeight?.weight, step) +
						minSpan,
				)}
			/>
		</View>
	);
};

export default WeightLogChartSmall;

const styles = StyleSheet.create({});
