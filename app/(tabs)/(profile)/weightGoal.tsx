import DatePickerSheet from "@/components/UIComponents/Calendar/DatePickerSheet";
import TimeWheel from "@/components/UIComponents/Calendar/TimeWheel";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import {
	PrimaryButton,
	SecondaryButton,
} from "@/components/UIComponents/Buttons/Button";
import { H4, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import { useGetLatestWeight } from "@/db/hooks/weight/useWeightLog";
import {
	useClearWeightGoal,
	useGetWeightGoal,
	useSaveWeightGoal,
} from "@/db/hooks/weightGoal/useWeightGoal";
import {
	formatWeight,
	snapToStep,
	toDisplay,
	toGrams,
	weightBounds,
} from "@/helper/units";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import { WeightGoalKind } from "@/types/weightGoal";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

const KINDS: { key: WeightGoalKind; label: string; hint: string }[] = [
	{ key: "lose", label: "Lose", hint: "Trend goes down to a target." },
	{ key: "gain", label: "Gain", hint: "Trend goes up to a target." },
	{
		key: "maintain",
		label: "Maintain",
		hint: "Hold a band. Also covers recomp — the scale stays flat by design.",
	},
];

function formatDate(date: Date) {
	return date.toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

/**
 * Weight goal.
 *
 * Its own screen rather than a card on Goals because the target picker is a wheel, and a
 * wheel is a `FlatList` — nesting it in a scrolling page is the one thing that reliably
 * breaks windowing in this app (see the date picker's note in docs/WEIGHT_GOALS.md).
 *
 * A `maintain` goal carries a band instead of a point, and never a date: there is no
 * finish line, so offering one would be dishonest.
 */
export default function WeightGoalScreen() {
	const router = useRouter();
	const unit = useUnitStore((state) => state.unit);

	const { data: goal, isLoading } = useGetWeightGoal();
	const { data: latest } = useGetLatestWeight();
	const { mutate: saveGoal, isPending: saving } = useSaveWeightGoal();
	const { mutate: clearGoal, isPending: clearing } = useClearWeightGoal();

	const bounds = weightBounds(unit);
	const step = unit === "lb" ? 1 : 0.5;
	const decimals = unit === "lb" ? 0 : 1;

	// The wheel scrolls through whole display units; the value it reports is converted to
	// grams only when saving.
	const values = useMemo(() => {
		const out: string[] = [];
		for (let value = bounds.min; value <= bounds.max + 1e-9; value += step) {
			out.push(value.toFixed(decimals));
		}
		return out;
	}, [bounds.min, bounds.max, step, decimals]);

	const toleranceOptions = unit === "lb" ? [1, 2] : [0.5, 1];
	/** A stored ±1 lb is 454 g, which converts back to 1.0009 — pick the option it means. */
	const nearestBand = (value: number) =>
		toleranceOptions.reduce((best, option) =>
			Math.abs(option - value) < Math.abs(best - value) ? option : best,
		);

	const [kind, setKind] = useState<WeightGoalKind>("lose");
	const [target, setTarget] = useState<number | null>(null);
	const [tolerance, setTolerance] = useState<number | null>(null);
	const [targetDate, setTargetDate] = useState<Date | null>(null);
	const [dateOpen, setDateOpen] = useState(false);

	// Seed once the stored goal (or, failing that, the latest weigh-in) is known. Opening
	// a new goal on "where I am now" means the wheel never has to be dragged across the
	// whole range.
	useEffect(() => {
		if (isLoading) return;
		// Snap onto the wheel's grid: a stored weight converts to 397.94 lb, and saving
		// exactly what the wheel shows keeps display and storage from disagreeing.
		if (goal) {
			setKind(goal.kind);
			setTarget(snapToStep(toDisplay(goal.target_weight, unit), step, bounds.min));
			setTolerance(
				goal.tolerance
					? nearestBand(toDisplay(goal.tolerance, unit))
					: null,
			);
			setTargetDate(goal.target_date ?? null);
			return;
		}
		if (latest) {
			setTarget(snapToStep(toDisplay(latest.weight, unit), step, bounds.min));
			setTolerance(unit === "lb" ? 1 : 0.5);
			setKind("lose");
		}
	}, [goal, latest, isLoading, unit]);

	const index = useMemo(() => {
		if (target === null) return 0;
		const raw = Math.round((target - bounds.min) / step);
		return Math.max(0, Math.min(values.length - 1, raw));
	}, [target, bounds.min, step, values.length]);

	const canSave = target !== null && !saving;

	function save() {
		if (target === null) return;
		saveGoal(
			{
				kind,
				targetWeight: toGrams(target, unit),
				// The band is a maintain-only concept; sending it for the other kinds would
				// persist a number nothing reads.
				tolerance:
					kind === "maintain"
						? toGrams(tolerance ?? toleranceOptions[0], unit)
						: null,
				targetDate: kind === "maintain" ? null : targetDate,
			},
			{
				onSuccess: () => {
					Toast.show({ type: "success", text1: "Weight goal saved" });
					router.back();
				},
				onError: () =>
					Toast.show({ type: "error", text1: "Couldn't save that goal" }),
			},
		);
	}

	function clear() {
		clearGoal(undefined, {
			onSuccess: () => {
				Toast.show({ type: "success", text1: "Weight goal cleared" });
				router.back();
			},
		});
	}

	const current = latest ? latest.weight : null;

	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple title="Weight goal" />

			<View style={styles.page}>
				<View style={styles.card}>
					<H4>Current</H4>
					{current === null ? (
						<H6 style={styles.muted}>
							No weigh-ins yet. The goal can still be set — progress needs
							something to compare against.
						</H6>
					) : (
						<H5_SemiBold>
							{formatWeight(current, unit)} {unit}
						</H5_SemiBold>
					)}
				</View>

				<View style={styles.card}>
					<H4>Goal</H4>
					<View style={styles.segmented}>
						{KINDS.map((option) => (
							<Pressable
								key={option.key}
								onPress={() => setKind(option.key)}
								accessibilityRole="button"
								accessibilityState={{ selected: kind === option.key }}
								style={[
									styles.segment,
									kind === option.key && styles.segmentActive,
								]}
							>
								<H5_SemiBold
									style={{
										color:
											kind === option.key
												? colors.white
												: colors.inactive,
									}}
								>
									{option.label}
								</H5_SemiBold>
							</Pressable>
						))}
					</View>
					<H6 style={styles.muted}>
						{KINDS.find((option) => option.key === kind)?.hint}
					</H6>
				</View>

				<View style={styles.card}>
					<H4>{kind === "maintain" ? "Hold around" : "Target"}</H4>
					<View style={styles.wheelWrap}>
						<TimeWheel
							values={values}
							index={index}
							onIndexChange={(next) => setTarget(Number(values[next]))}
							width={96}
							visibleRows={3}
						/>
						<H5_SemiBold style={styles.muted}>{unit}</H5_SemiBold>
					</View>

					{kind === "maintain" ? (
						<>
							<H6 style={styles.muted}>Band</H6>
							<View style={styles.segmented}>
								{toleranceOptions.map((option) => {
									const active =
										nearestBand(tolerance ?? toleranceOptions[0]) === option;
									return (
										<Pressable
											key={option}
											onPress={() => setTolerance(option)}
											accessibilityRole="button"
											accessibilityState={{ selected: active }}
											style={[styles.segment, active && styles.segmentActive]}
										>
											<H5_SemiBold
												style={{
													color: active ? colors.white : colors.inactive,
												}}
											>
												± {option} {unit}
											</H5_SemiBold>
										</Pressable>
									);
								})}
							</View>
						</>
					) : (
						<>
							<H6 style={styles.muted}>Target date (optional)</H6>
							<Pressable
								onPress={() => setDateOpen(true)}
								style={styles.dateRow}
								accessibilityRole="button"
							>
								<H5_SemiBold>
									{targetDate ? formatDate(targetDate) : "No date"}
								</H5_SemiBold>
								{targetDate ? (
									<Pressable onPress={() => setTargetDate(null)}>
										<H6 style={{ color: colors.inactive }}>Clear</H6>
									</Pressable>
								) : null}
							</Pressable>
						</>
					)}
				</View>

				{/* No flex spacer: with one, the two buttons were pushed under the tab
				    bar. The page is short enough to stack them after the cards. */}
				<PrimaryButton onPress={save} disabled={!canSave}>
					{saving ? "Saving…" : "Save goal"}
				</PrimaryButton>
				{goal ? (
					<SecondaryButton onPress={clear} disabled={clearing}>
						{clearing ? "Clearing…" : "Remove goal"}
					</SecondaryButton>
				) : null}
			</View>

			<DatePickerSheet
				visible={dateOpen}
				value={targetDate ?? new Date()}
				onChange={setTargetDate}
				onClose={() => setDateOpen(false)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 20,
		gap: 16,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 10,
	},
	segmented: {
		flexDirection: "row",
		backgroundColor: colors.off_white,
		borderRadius: 8,
		padding: 3,
		gap: 3,
	},
	segment: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: 6,
		alignItems: "center",
	},
	segmentActive: {
		backgroundColor: colors.primary,
	},
	wheelWrap: {
		alignItems: "center",
		gap: 4,
	},
	dateRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: colors.off_white,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	muted: {
		color: colors.inactive,
	},
});
