import {
	axisMinSpan,
	axisPadding,
	axisStep,
	toDisplay,
} from "@/helper/units";
import { valueDomain } from "@/helper/weightChartScale";
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
/**
 * Points for the sparkline.
 *
 * Dates on every other point, counting back from the newest. Seven labels across 275 px
 * ran off the right edge, and two readings on the same day printed the same date twice.
 */
const formatWeightForChart = (weightData: WeightPoint[]) =>
	weightData.map((item, index) => ({
		value: item.weight,
		// Skip the newest point: its label is centred at the right edge of the plot and
		// gets clipped (there is no trailing-space prop to make room). Its date is in the
		// "last logged" line above anyway.
		label:
			index < weightData.length - 1 && (weightData.length - 1 - index) % 2 === 1
				? `${item.timestamp.getMonth() + 1}/${item.timestamp.getDate()}`
				: "",
	}));

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

	// Shared with the full chart so the two can never disagree about the scale.
	const domain = valueDomain(
		(display ?? []).map((point) => point.weight),
		null,
		{ minSpan: axisMinSpan(unit), pad: axisPadding(unit) },
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
				stepValue={domain.step}
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
				// Same domain rules as the full chart: padding at both ends, snapped outward.
				// The old hand-rolled version was `offset = min - pad` and `max = (max - min)
				// + minSpan`, which tops out at `max - pad + minSpan` — once `minSpan` became
				// small, that ceiling landed below the highest reading and the line vanished.
				yAxisOffset={domain.min}
				maxValue={domain.max - domain.min}
			/>
		</View>
	);
};

export default WeightLogChartSmall;

const styles = StyleSheet.create({});
