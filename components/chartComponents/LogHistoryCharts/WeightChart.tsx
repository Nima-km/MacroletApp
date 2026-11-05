import { H6 } from "@/components/UIComponents/Typography";
import { axisMinSpan, axisPadding, toDisplay, unitHeading } from "@/helper/units";
import {
	CHART_LAYOUT,
	labelIndices,
	nearestPointIndex,
	timeDomain,
	timeToX,
	valueDomain,
	valueToY,
} from "@/helper/weightChartScale";
import { WeightPeriod, shouldBridge } from "@/helper/weightRange";
import { emaTrend, WeightPoint } from "@/helper/weightTrend";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import {
	Canvas,
	Circle,
	DashPathEffect,
	Line,
	LinearGradient,
	Path,
	Rect,
	RoundedRect,
	Skia,
	Text as SkText,
	useFont,
	vec,
} from "@shopify/react-native-skia";
import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

export type ChartBucket = WeightPoint & {
	min?: number;
	max?: number;
	minWeight?: number;
	maxWeight?: number;
};

export type ChartGoal = {
	targetWeight: number;
	tolerance?: number | null;
};

type Props = {
	weightData?: ChartBucket[];
	/** The goal in force. Passed in grams. */
	goal?: ChartGoal | null;
	period?: WeightPeriod;
	height?: number;
};

/** Fixed half-life, so "the trend" covers the same span at 1W and at All. */
const TREND_HALF_LIFE_DAYS = 14;
/** Rings stop being a help past this many marks. */
const MAX_MARKED_POINTS = 7;

export default function WeightChart({
	weightData,
	goal,
	period = "day",
	height = 200,
}: Props) {
	const unit = useUnitStore((state) => state.unit);
	const font = useFont(require("@/assets/fonts/Metropolis-Regular.ttf"), 11);
	const valueFont = useFont(require("@/assets/fonts/Metropolis-SemiBold.ttf"), 12);
	const tooltipValueFont = useFont(
		require("@/assets/fonts/Metropolis-SemiBold.ttf"),
		17,
	);
	const tooltipFont = useFont(require("@/assets/fonts/Metropolis-Regular.ttf"), 12);

	const [width, setWidth] = useState(0);
	const [heldIndex, setHeldIndex] = useState<number | null>(null);

	// Axis ticks and goal labels stay coarse; the readout is the one place a tenth matters.
	const decimals = unit === "lb" ? 0 : 1;
	const readoutDecimals = 1;

	const points = useMemo(
		() =>
			(weightData ?? [])
				.map((record) => {
					const min = record.min ?? record.minWeight;
					const max = record.max ?? record.maxWeight;
					return {
						timestamp: record.timestamp,
						value: toDisplay(record.weight, unit),
						min: min === undefined ? undefined : toDisplay(min, unit),
						max: max === undefined ? undefined : toDisplay(max, unit),
					};
				})
				.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
		[weightData, unit],
	);

	const trend = useMemo(
		() =>
			emaTrend(
				points.map((point) => ({
					timestamp: point.timestamp,
					weight: point.value,
				})),
				{ halfLifeDays: TREND_HALF_LIFE_DAYS },
			),
		[points],
	);

	const goalValue =
		goal?.targetWeight === undefined ? null : toDisplay(goal.targetWeight, unit);
	const goalBand =
		goal?.tolerance === undefined || goal?.tolerance === null
			? null
			: toDisplay(goal.tolerance, unit);

	const time = timeDomain(points);
	const domain = valueDomain(
		points.map((point) => point.value),
		goalValue,
		{ minSpan: axisMinSpan(unit), pad: axisPadding(unit) },
	);

	const plotWidth = Math.max(0, width - CHART_LAYOUT.left - CHART_LAYOUT.right);
	const plotHeight = Math.max(0, height - CHART_LAYOUT.top - CHART_LAYOUT.bottom);

	const x = (point: { timestamp: Date }) =>
		timeToX(point.timestamp.getTime(), time, CHART_LAYOUT.left, plotWidth);
	const y = (value: number) =>
		valueToY(value, domain, CHART_LAYOUT.top, plotHeight);

	/** Consecutive runs, split where the gap is too long to join. */
	const segments = useMemo(() => {
		const out: typeof points[] = [];
		let run: typeof points = [];
		points.forEach((point, index) => {
			if (index > 0) {
				const gap =
					point.timestamp.getTime() - points[index - 1].timestamp.getTime();
				if (!shouldBridge(gap, period)) {
					if (run.length) out.push(run);
					run = [];
				}
			}
			run.push(point);
		});
		if (run.length) out.push(run);
		return out;
	}, [points, period]);

	/**
	 * Straight segments between the points, deliberately.
	 *
	 * A smoothed curve (Catmull-Rom, cubic) overshoots between points: two readings either
	 * side of a low can produce a curve that dips lower than either of them, drawing a
	 * weight the person never weighed. On a chart whose entire job is fidelity to
	 * measurements, that is a lie told in the service of elegance.
	 */
	const lineInto = (
		path: ReturnType<typeof Skia.Path.Make>,
		coords: { x: number; y: number }[],
	) => {
		coords.forEach((coord, index) => {
			if (index === 0) path.moveTo(coord.x, coord.y);
			else path.lineTo(coord.x, coord.y);
		});
		return path;
	};

	/** Trend split into runs at the same gaps as the readings. */
	const trendRuns = useMemo(() => {
		const out: { x: number; y: number }[][] = [];
		let run: { x: number; y: number }[] = [];
		trend.forEach((point, index) => {
			if (index > 0) {
				const gap = point.timestamp.getTime() - trend[index - 1].timestamp.getTime();
				if (!shouldBridge(gap, period)) {
					if (run.length) out.push(run);
					run = [];
				}
			}
			run.push({
				x: timeToX(point.timestamp.getTime(), time, CHART_LAYOUT.left, plotWidth),
				y: y(point.trend),
			});
		});
		if (run.length) out.push(run);
		return out;
	}, [trend, width, height, unit, domain.min, domain.max, period]);

	const trendPath = useMemo(() => {
		const path = Skia.Path.Make();
		trendRuns.forEach((run) => lineInto(path, run));
		return path;
	}, [trendRuns]);

	/** The same runs, closed down to the floor — the soft fill under the trend. */
	const fillPath = useMemo(() => {
		const path = Skia.Path.Make();
		const floor = CHART_LAYOUT.top + plotHeight;
		trendRuns.forEach((run) => {
			if (run.length < 2) return;
			lineInto(path, run);
			path.lineTo(run[run.length - 1].x, floor);
			path.lineTo(run[0].x, floor);
			path.close();
		});
		return path;
	}, [trendRuns, plotHeight]);

	const readingPath = useMemo(() => {
		const path = Skia.Path.Make();
		segments.forEach((run) =>
			lineInto(
				path,
				run.map((point) => ({ x: x(point), y: y(point.value) })),
			),
		);
		return path;
	}, [segments, width, height, unit, domain.min, domain.max]);

	const labels = labelIndices(points.length);

	// Three ticks is enough to anchor the scale; more turns the plot back into graph paper.
	const axisTicks = (() => {
		const all = domain.ticks;
		if (all.length <= 3) return all;
		const middle = all[Math.floor((all.length - 1) / 2)];
		return [all[0], middle, all[all.length - 1]];
	})();
	const tickDecimals = (() => {
		if (axisTicks.length < 2) return 0;
		const step = Math.abs(axisTicks[1] - axisTicks[0]);
		return step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
	})();
	const showRings = points.length <= MAX_MARKED_POINTS;
	const latest = points[points.length - 1];

	const held =
		heldIndex !== null && heldIndex >= 0 && heldIndex < points.length
			? points[heldIndex]
			: null;

	function onTouch(locationX: number) {
		if (points.length === 0) return;
		setHeldIndex(
			nearestPointIndex(points, locationX, time, CHART_LAYOUT.left, plotWidth),
		);
	}

	const spanDays = (time.max - time.min) / (24 * 60 * 60 * 1000);

	function labelFor(point: { timestamp: Date }) {
		const date = point.timestamp;
		// Past a few months a day-of-month is noise; past a year even the month repeats, so
		// the year becomes the only unambiguous tick. ("Nov 21" would read as 21 November.)
		if (spanDays > 400) return String(date.getFullYear());
		if (period === "month" || spanDays > 120) {
			return date.toLocaleDateString(undefined, { month: "short" });
		}
		return `${date.getMonth() + 1}/${date.getDate()}`;
	}

	return (
		<View>
			<View
				style={{ height }}
				onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
				onStartShouldSetResponderCapture={() => points.length > 0}
				onMoveShouldSetResponderCapture={() => points.length > 0}
				onResponderGrant={(event) => onTouch(event.nativeEvent.locationX)}
				onResponderMove={(event) => onTouch(event.nativeEvent.locationX)}
				onResponderRelease={() => setHeldIndex(null)}
				onResponderTerminate={() => setHeldIndex(null)}
			>
				{width > 0 && font ? (
					<Canvas style={{ flex: 1 }}>
						{/* A sparse value axis: three labels, hairline rules rather than a grid.
						    Without it the plot had no visible scale at all. */}
						{axisTicks.map((tick) => (
							<React.Fragment key={`axis-${tick}`}>
								<Line
									p1={vec(CHART_LAYOUT.left, y(tick))}
									p2={vec(CHART_LAYOUT.left + plotWidth, y(tick))}
									color="rgba(46,34,28,0.06)"
									strokeWidth={1}
								/>
								<SkText
									x={
										CHART_LAYOUT.left -
										6 -
										font.getTextWidth(tick.toFixed(tickDecimals))
									}
									y={y(tick) + 3.5}
									text={tick.toFixed(tickDecimals)}
									font={font}
									color={colors.inactive}
								/>
							</React.Fragment>
						))}

						{/* Goal: one dotted rule with its value at the end, so nothing else
						    in the plot is dashed. */}
						{goalValue !== null ? (
							<>
								<Path
									path={(() => {
										const path = Skia.Path.Make();
										path.moveTo(CHART_LAYOUT.left, y(goalValue));
										path.lineTo(CHART_LAYOUT.left + plotWidth, y(goalValue));
										return path;
									})()}
									style="stroke"
									strokeWidth={1.5}
									color={colors.inactive}
								>
									<DashPathEffect intervals={[2, 5]} />
								</Path>
								<SkText
									x={
										CHART_LAYOUT.left +
										plotWidth -
										font.getTextWidth(`goal ${goalValue.toFixed(decimals)}`)
									}
									y={Math.min(
										height - CHART_LAYOUT.bottom - 4,
										Math.max(CHART_LAYOUT.top + 8, y(goalValue) - 6),
									)}
									text={`goal ${goalValue.toFixed(decimals)}`}
									font={font}
									color={colors.inactive}
								/>
							</>
						) : null}

						{/* The soft fill under the trend. */}
						<Path path={fillPath} style="fill">
							<LinearGradient
								start={vec(0, CHART_LAYOUT.top)}
								end={vec(0, CHART_LAYOUT.top + plotHeight)}
								colors={["rgba(187,56,0,0.10)", "rgba(187,56,0,0.005)"]}
							/>
						</Path>

						{/* Individual weigh-ins, deliberately quiet. */}
						<Path
							path={readingPath}
							style="stroke"
							strokeWidth={1.5}
							color={colors.primary_inactive}
							strokeCap="round"
							strokeJoin="round"
						/>

						{/* Trend: the one bold line. */}
						<Path
							path={trendPath}
							style="stroke"
							strokeWidth={3}
							color={colors.primary}
							strokeCap="round"
							strokeJoin="round"
						/>

						{/* Rings only while there are few enough to mark days. */}
						{showRings
							? points.map((point, index) => (
									<React.Fragment key={`ring-${index}`}>
										<Circle
											cx={x(point)}
											cy={y(point.value)}
											r={5}
											color={colors.white}
										/>
										<Circle
											cx={x(point)}
											cy={y(point.value)}
											r={3.5}
											color={colors.primary}
											style="stroke"
											strokeWidth={2.5}
										/>
									</React.Fragment>
								))
							: null}

						{/* The latest reading is the anchor: one filled dot and its value. */}
						{held && tooltipValueFont && tooltipFont ? (() => {
							const valueText = `${held.value.toFixed(readoutDecimals)}`;
							const spreadText =
								held.min !== undefined &&
								held.max !== undefined &&
								Math.abs(held.max - held.min) >= (unit === "lb" ? 0.5 : 0.2)
									? `${held.min.toFixed(readoutDecimals)}–${held.max.toFixed(readoutDecimals)}`
									: null;
							const dateText = labelFor(held);
							const padding = 12;
							const widest = Math.max(
								tooltipValueFont!.getTextWidth(valueText),
								tooltipFont!.getTextWidth(dateText),
								spreadText ? tooltipFont!.getTextWidth(spreadText) : 0,
							);
							const boxWidth = widest + padding * 2;
							const boxHeight = spreadText ? 62 : 48;
							const gap = 24;
							const dotX = x(held);
							const dotY = y(held.value);
							// Always above the point. Near the top of the plot the box is pushed
							// up to the canvas edge rather than flipped underneath, which is
							// where it would cover the axis it is describing.
							const boxY = Math.max(0, dotY - boxHeight - gap);
							// Only draw the notch when there is room between box and dot.
							const notchFits = boxY + boxHeight <= dotY - 2;
							const boxX = Math.min(
								CHART_LAYOUT.left + plotWidth - boxWidth,
								Math.max(0, dotX - boxWidth / 2),
							);
							const notchX = Math.min(boxX + boxWidth - 12, Math.max(boxX + 12, dotX));
							const notchY = boxY + boxHeight;
							const notch = Skia.Path.Make();
							notch.moveTo(notchX - 6, notchY);
							notch.lineTo(notchX + 6, notchY);
							notch.lineTo(notchX, notchY + 7);
							notch.close();

							return (
								<>
									<RoundedRect x={boxX} y={boxY} width={boxWidth} height={boxHeight} r={10} color={colors.white} />
									<RoundedRect x={boxX} y={boxY} width={boxWidth} height={boxHeight} r={10} color={colors.light_gray} style="stroke" strokeWidth={1} />
									{notchFits ? <Path path={notch} color={colors.white} /> : null}
									<SkText x={boxX + padding} y={boxY + 22} text={valueText} font={tooltipValueFont} color={colors.black} />
									<SkText x={boxX + padding} y={boxY + 38} text={dateText} font={tooltipFont!} color={colors.inactive} />
									{spreadText ? (
										<SkText x={boxX + padding} y={boxY + 53} text={spreadText} font={tooltipFont!} color={colors.inactive} />
									) : null}
									<Circle
										cx={dotX}
										cy={dotY}
										r={4.5}
										color={colors.primary}
									/>
								</>
							);
						})() : null}

						{(() => {
							// Draw left to right, skipping any label that would collide with the
							// previous one — at month granularity two ticks can fall on the same
							// spot and read as "OctNov".
							let lastRight = -Infinity;
							return labels.map((index) => {
								const point = points[index];
								if (!point) return null;
								const text = labelFor(point);
								const textWidth = font.getTextWidth(text);
								const left = Math.min(
									width - textWidth - 2,
									Math.max(2, x(point) - textWidth / 2),
								);
								if (left < lastRight + 8) return null;
								lastRight = left + textWidth;
								return (
									<SkText
										key={`label-${index}`}
										x={left}
										y={height - 4}
										text={text}
										font={font}
										color={colors.medium_gray}
									/>
								);
							});
						})()}
					</Canvas>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	unitText: {
		color: colors.inactive,
		marginBottom: 2,
	},
});
