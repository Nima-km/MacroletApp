import { H5, H6 } from "@/components/UIComponents/Typography";
import { bigRound } from "@/helper/bigRound";
import {
	axisMinSpan,
	axisPadding,
	axisStep,
	toDisplay,
	unitHeading,
} from "@/helper/units";
import { emaTrend, WeightPoint } from "@/helper/weightTrend";
import { useUnitStore } from "@/store/unitStore";
import { colors, typography } from "@/theme";
import { nutritionGoalGet } from "@/types/goals";
import { WeightType } from "@/types/weight";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { CurveType, LineChart } from "react-native-gifted-charts";

interface Props {
	weightData?: WeightPoint[];
	showWeight?: boolean;
	goal?: nutritionGoalGet;
	onSelect: (item: WeightType) => void;
}

/** A reading being held, in display units. */
type Held = { weight: number; date: Date };

/**
 * Weight against time.
 *
 * The readings are the series: every weigh-in is a point, and the line through them is
 * the recorded data. The trend is a dashed annotation on top — it answers "where is this
 * going", which the readings alone cannot because they move with water and food.
 *
 * Values are not labelled on the points. Eight readings across ~250 px overlap into
 * nonsense, so a reading is read by holding its dot, which shows it in a box.
 */
/** Geometry, in dp, shared by the drawing props below and the touch mapping. */
const AXIS_WIDTH = 41; // y-axis labels (36) + their margin (5)
const INITIAL_SPACING = 34;
const SPACING = 30;

const WeightChartFull = ({ weightData, onSelect }: Props) => {
	const unit = useUnitStore((state) => state.unit);
	const step = axisStep(unit);
	const pad = axisPadding(unit);
	const minSpan = axisMinSpan(unit);

	// Which reading is held, if any.
	const [held, setHeld] = useState<Held | null>(null);
	// The dot needs to know whether *it* is the held one to draw its highlight.
	const [heldAt, setHeldAt] = useState<number | null>(null);

	/**
	 * Which reading a touch is closest to.
	 *
	 * The y-axis labels occupy `AXIS_WIDTH` and the first point is `INITIAL_SPACING`
	 * further in; points are `SPACING` apart after that. These are the same constants the
	 * chart is drawn with, so this is exact rather than an approximation.
	 */
	const selectNearest = (x: number) => {
		if (!display?.length) return;
		const raw = Math.round((x - (AXIS_WIDTH + INITIAL_SPACING)) / SPACING);
		const index = Math.max(0, Math.min(display.length - 1, raw));
		setHeldAt(index);
		setHeld({ weight: display[index].weight, date: display[index].timestamp });
	};

	// Pounds are quoted whole; kilograms keep a decimal, because 2.2 lb between whole
	// kilograms would hide real movement.
	const decimals = unit === "lb" ? 0 : 1;

	// Stored grams -> the unit on screen, once, before any chart arithmetic.
	const display = weightData?.map((record) => ({
		...record,
		weight: toDisplay(record.weight, unit),
	}));

	const lineData = display?.map((item, index) => ({
		value: item.weight,

		// Every other date: eight of them across the plot truncate to "10…". Counting back
		// from the newest keeps the most recent date on the axis.
		label:
			(display.length - 1 - index) % 2 === 0
				? `${item.timestamp.getMonth() + 1}/${item.timestamp.getDate()}`
				: "",
		customDataPoint: () => <View style={[styles.dot, heldAt === index && styles.dotHeld]} />,
	}));

	const trendData = display
		? emaTrend(display).map((point) => ({ value: point.trend }))
		: undefined;

	const minWeight = display?.reduce((a, b) =>
		a.weight < b.weight || b.weight == 0 ? a : b,
	);
	const maxWeight = display?.reduce((a, b) =>
		a.weight > b.weight ? a : b,
	);

	const stepValue =
		minWeight && maxWeight
			? Math.ceil(
					Math.max(maxWeight.weight - minWeight.weight, step) / 7 / step,
				) * step
			: step;

	return (
		<View>
			<View style={styles.header}>
				<H5 style={styles.unit}>{unitHeading(unit)}</H5>
				{held ? (
					<View style={styles.tooltip} pointerEvents="none">
						<H6 style={styles.tooltipValue}>
							{held.weight.toFixed(decimals)} {unitHeading(unit)}
						</H6>
						<H6 style={styles.tooltipDate}>
							{held.date.getMonth() + 1}/{held.date.getDate()}
						</H6>
					</View>
				) : null}
			</View>

			{/* Touches are handled here rather than by the chart: the fork only makes a
			    point pressable through an item-level `onPress`, and the pointer API never
			    activated from a held touch. The plot's geometry is fixed and known, so
			    the nearest reading is a division. */}
			<View
				onStartShouldSetResponderCapture={() => true}
				onMoveShouldSetResponderCapture={() => true}
				onResponderGrant={(event) => selectNearest(event.nativeEvent.locationX)}
				onResponderMove={(event) => selectNearest(event.nativeEvent.locationX)}
				onResponderRelease={() => setHeldAt(null)}
				onResponderTerminate={() => setHeldAt(null)}
			>
			<LineChart
				data={lineData}
				curved
				curveType={CurveType.CUBIC}
				stepValue={stepValue}
				showFractionalValues={false}
				dashGap={0}
				width={290}
				color={colors.primary}
				focusEnabled
				yAxisTextStyle={[typography.h6, { color: colors.black }]}
				yAxisLabelContainerStyle={{ width: 36, marginRight: 5 }}
				yAxisLabelWidth={36}
				xAxisLabelTextStyle={{ fontSize: 10, color: colors.inactive }}
				dataPointsHeight={12}
				dataPointsWidth={12}
				thickness={3}
				// Readings solid; trend dashed and quieter.
				data2={trendData}
				color2={colors.inactive}
				thickness2={2}
				strokeDashArray2={[5, 4]}
				hideDataPoints2
				// Eight days fit the 290 px width at this spacing; at 41 the content
				// overflowed and `scrollToEnd` cut the first point off the left edge.
				initialSpacing={INITIAL_SPACING}
				spacing={SPACING}
				yAxisThickness={0}
				xAxisColor={colors.light_gray}
				yAxisOffset={Math.max(bigRound(minWeight?.weight, step) - pad, 0)}
				maxValue={Math.max(
					minSpan,
					bigRound(maxWeight?.weight, step) -
						bigRound(minWeight?.weight, step) +
						minSpan,
				)}
				scrollToEnd
			/>
			</View>
		</View>
	);
};

export default WeightChartFull;

const styles = StyleSheet.create({
	header: {
		position: "relative",
		height: 22,
		justifyContent: "center",
	},
	unit: {
		width: 31,
	},
	dot: {
		width: 12,
		height: 12,
		backgroundColor: colors.white,
		borderWidth: 3,
		borderRadius: 10,
		borderColor: colors.primary,
	},
	dotHeld: {
		backgroundColor: colors.primary,
		width: 16,
		height: 16,
	},
	tooltip: {
		position: "absolute",
		right: 0,
		top: -6,
		backgroundColor: colors.black,
		borderRadius: 6,
		paddingHorizontal: 10,
		paddingVertical: 6,
		alignItems: "center",
	},
	tooltipValue: {
		color: colors.white,
	},
	tooltipDate: {
		color: colors.light_gray,
	},
});
