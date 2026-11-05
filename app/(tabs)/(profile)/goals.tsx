import MacroBar from "@/components/chartComponents/MacroCharts/MacroBar";
import TimeWheel from "@/components/UIComponents/Calendar/TimeWheel";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H1, H3, H4, H4_Bold, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import {
	useGetNutriGoalHistory,
	useGetNutriGoals,
	useInsertNutritionGoal,
} from "@/db/hooks/goals/nutritionGoal";
import { useAdaptiveGoal } from "@/db/hooks/goals/useAdaptiveGoal";
import { useGetMacroProfiles } from "@/db/hooks/macroProfile/useMacroProfile";
import { useMaintenanceEstimate } from "@/db/hooks/weight/useMaintenance";
import { useGetLatestWeight } from "@/db/hooks/weight/useWeightLog";
import { useActiveMacroProfile } from "@/db/hooks/macroProfile/useMacroProfile";
import { safeTarget } from "@/helper/calorieTarget";
import { interpolateProfile } from "@/helper/macroProfile";
import { scaleMacros } from "@/helper/adaptiveGoal";
import { bmrMifflin } from "@/helper/profile";
import { useSubscriptionState } from "@/api/hooks/useSubscriptionState";
import { changeLine } from "@/helper/adaptiveGoal";
import { calculateCalories } from "@/helper/calculateCalories";
import { profileRange } from "@/helper/macroProfile";
import { useGetWeightGoal } from "@/db/hooks/weightGoal/useWeightGoal";
import {
	ACTIVITY_LABELS,
	ageFromBirthYear,
	isProfileComplete,
} from "@/helper/profile";
import { formatBand, formatWeight } from "@/helper/units";
import { useGetProfile } from "@/db/hooks/profile/useProfile";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import type { WeightUnit } from "@/helper/units";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from "react-native";

/**
 * Macro goals.
 *
 * The wheels replace three number fields. A goal is a value you nudge — a few grams up
 * or down — which is exactly the gesture a wheel is good at, and it keeps the page to a
 * single screen with the calories updating as you move them.
 *
 * Steps of 5 g: nobody wants to spin a wheel 200 rows to reach 150 g protein, and a
 * macro target is not a figure that needs single-gram precision.
 */
const STEP = 5;

const COLUMNS = [
	{ key: "protein", label: "PROTEIN", color: colors.protein, max: 400 },
	{ key: "carbs", label: "CARBS", color: colors.carbs, max: 600 },
	{ key: "fat", label: "FAT", color: colors.fat, max: 250 },
] as const;

/** 0, 5, 10 ... max — the labels the wheel scrolls through. */
const valuesFor = (max: number) =>
	Array.from({ length: Math.floor(max / STEP) + 1 }, (_, i) =>
		String(i * STEP),
	);

/** Snap a stored gram value onto the wheel. */
const indexFor = (grams: number, max: number) =>
	Math.min(Math.floor(max / STEP), Math.max(0, Math.round(grams / STEP)));

/**
 * A macro value you can nudge or type.
 *
 * Replaces three `TimeWheel`s. A wheel is the right control for a long range like
 * time-of-day; for a value that moves in 5 g steps it is slow, and three of them nested in a
 * scrolling page is a warning React Native prints for good reason. Typing covers the jump,
 * the buttons cover the nudge.
 */
function MacroStepper({
	label,
	color,
	value,
	max,
	onChange,
}: {
	label: string;
	color: string;
	value: number;
	max: number;
	onChange: (next: number) => void;
}) {
	const [draft, setDraft] = useState(String(value));
	useEffect(() => setDraft(String(value)), [value]);

	const clamp = (next: number) =>
		Math.max(0, Math.min(max, Math.round(next / STEP) * STEP));

	const commit = () => {
		const parsed = Number(draft);
		const next = Number.isFinite(parsed) ? clamp(parsed) : value;
		onChange(next);
		// Show what was actually accepted, so a rejected entry does not look applied.
		setDraft(String(next));
	};

	return (
		<View style={styles.stepperRow}>
			<View style={[styles.pill, { backgroundColor: color }]} />
			<H4_Bold style={styles.stepperLabel}>{label}</H4_Bold>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`Decrease ${label}`}
				onPress={() => onChange(clamp(value - STEP))}
				style={styles.stepperButton}
			>
				<H3 style={{ color: colors.primary }}>−</H3>
			</Pressable>
			<TextInput
				value={draft}
				onChangeText={setDraft}
				onBlur={commit}
				onSubmitEditing={commit}
				keyboardType="number-pad"
				returnKeyType="done"
				selectTextOnFocus
				style={styles.stepperInput}
				accessibilityLabel={`${label} in grams`}
			/>
			<H6 style={{ color: colors.inactive }}>g</H6>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`Increase ${label}`}
				onPress={() => onChange(clamp(value + STEP))}
				style={styles.stepperButton}
			>
				<H3 style={{ color: colors.primary }}>+</H3>
			</Pressable>
		</View>
	);
}

const goals = () => {
	const { mutate: addNewGoal } = useInsertNutritionGoal();
	const { data: nutriGoals, isLoading: nutriGoalsLoading } =
		useGetNutriGoals();

	const unit = useUnitStore((state) => state.unit);
	const setUnit = useUnitStore((state) => state.setUnit);
	const router = useRouter();
	const { data: weightGoal } = useGetWeightGoal();
	const { data: storedProfile } = useGetProfile();
	const { data: latestWeight } = useGetLatestWeight();
	useAdaptiveGoal();
	const { data: goalHistory } = useGetNutriGoalHistory(2);
	const profile = storedProfile ?? {};
	const { data: macroProfiles } = useGetMacroProfiles();



	// One line that answers "what am I aiming at" without opening the editor.
	const weightGoalSummary = weightGoal
		? weightGoal.kind === "maintain"
			? `Maintain around ${formatWeight(weightGoal.target_weight, unit)} ${unit}${
					weightGoal.tolerance
						? ` ±${formatBand(weightGoal.tolerance, unit)}`
						: ""
				}`
			: `${weightGoal.kind === "lose" ? "Lose to" : "Gain to"} ${formatWeight(
					weightGoal.target_weight,
					unit,
				)} ${unit}`
		: "Not set";

	// The same one-line answer for the body profile: either what it holds, or why it is
	// worth filling in. Activity is cut at the em dash so the row stays short.
	const bodyProfileComplete = isProfileComplete(profile);
	const bodyProfileSummary = bodyProfileComplete
		? `${Math.round(profile.heightCm)} cm · ${
				profile.sex === "male" ? "Male" : "Female"
			} · ${ageFromBirthYear(profile.birthYear, new Date())} · ${
				ACTIVITY_LABELS[profile.activity].split(" — ")[0]
			}`
		: "Needed for a starting calorie estimate";

	// Which macro profile is in force and the calories it covers. A preset's zero origin is
	// the curve's anchor rather than a calorie level, so the range starts at the first real
	// checkpoint — "0–2,650 kcal" would misdescribe a profile that starts at 1,580.
	const activeMacroProfile =
		macroProfiles?.find((entry) => entry.active) ?? null;
	const macroProfileRange = activeMacroProfile
		? profileRange(
				activeMacroProfile.checkpoints.filter(
					(checkpoint) => checkpoint.calories > 0,
				),
			)
		: null;
	const macroProfileSummary =
		activeMacroProfile && macroProfileRange && macroProfileRange.to > 0
			? `${activeMacroProfile.name} · ${macroProfileRange.from.toLocaleString()}–${macroProfileRange.to.toLocaleString()} kcal`
			: activeMacroProfile?.name ?? "Turn a calorie target into macros";

	const [protein, setProtein] = useState(0);
	const [carbs, setCarbs] = useState(0);
	const [fat, setFat] = useState(0);

	useEffect(() => {
		const saved = nutriGoals?.[0];
		if (!saved) return;
		setProtein(Math.round(saved.protein / STEP) * STEP);
		setCarbs(Math.round(saved.carbs / STEP) * STEP);
		setFat(Math.round(saved.fat / STEP) * STEP);
	}, [nutriGoals]);

	const calories = useMemo(
		() => calculateCalories({ protein, carbs, fat }),
		[protein, carbs, fat],
	);

	const currentGoal = nutriGoals?.[0];
	const isAdaptive = (currentGoal?.source ?? "manual") === "adaptive";

	/**
	 * What the big number means depends on where the goal comes from.
	 *
	 * In manual mode the macros are the input and the calories are their sum — which is why
	 * nudging protein moves the target. In adaptive mode it is the other way round: the
	 * algorithm sets the calories and the macros follow. Showing the macro sum there made the
	 * target look frozen when the source was switched.
	 */
	const displayedCalories =
		isAdaptive && (currentGoal?.calories ?? 0) > 0
			? (currentGoal?.calories as number)
			: calories;

	// Pro decides whether the number is even computed for display; the hook stays mounted so
	// a purchase takes effect without a reload.
	const { data: subscription } = useSubscriptionState();
	const maintenanceUnlocked = subscription?.entitled === true;

	const { estimate: maintenanceEstimate } = useMaintenanceEstimate();
	const maintenanceSummary = !maintenanceUnlocked
		? "Pro · how many calories you actually burn"
		: maintenanceEstimate?.maintenance === null || maintenanceEstimate === null
			? "Not enough data yet"
			: `${maintenanceEstimate.maintenance.toLocaleString()} ± ${maintenanceEstimate.range ?? 0} kcal · ${maintenanceEstimate.tier}`;

	/** The line the adaptive card shows: what last moved, and from where. */
	const changeSummary = useMemo(() => {
		const latest = goalHistory?.[0];
		const previous = goalHistory?.[1];
		if (!latest || !previous || latest.source !== "adaptive") return null;
		const kcal = (row: typeof latest) =>
			row.calories > 0
				? row.calories
				: Math.round(row.protein * 4 + row.carbs * 4 + row.fat * 9);
		if (kcal(latest) === kcal(previous)) return null;
		return changeLine(
			kcal(previous),
			kcal(latest),
			previous.maintenance ?? null,
			latest.maintenance ?? 0,
		);
	}, [goalHistory]);

	/**
	 * Switching the source appends a row, like every other goal change.
	 *
	 * Turning adaptivity on keeps today's number — the weekly job will move it from there —
	 * so the switch never changes what someone eats on the day they flip it.
	 */
	function setSource(source: "manual" | "adaptive") {
		if (!currentGoal || currentGoal.source === source) return;

		const timestamp = new Date().toISOString();
		const stamp = { timestamp };
		const keep = {
			calories,
			protein,
			carbs,
			fat,
			maintenance: currentGoal.maintenance ?? null,
		};

		if (source === "manual") {
			addNewGoal({ ...keep, ...stamp, source });
			return;
		}

		// Turning adaptivity on asks the algorithm now, rather than waiting for the weekly
		// job to crawl to the same answer. A switch is a deliberate request, so it is not
		// rate-limited the way an automatic weekly adjustment is.
		const maintenance = maintenanceEstimate?.maintenance ?? null;
		if (maintenance === null) {
			// No estimate yet: carry today's numbers and let the weekly job take over when
			// it has something to work with.
			addNewGoal({ ...keep, ...stamp, source });
			return;
		}

		const now = new Date();
		const kg = (latestWeight?.weight ?? 0) / 1000;
		const bmr =
			kg > 0 && profile.heightCm && profile.sex
				? bmrMifflin(
						kg,
						profile.heightCm,
						ageFromBirthYear(profile.birthYear ?? 1990, now),
						profile.sex,
					)
				: null;

		const safe = safeTarget({
			maintenance,
			weightKg: kg > 0 ? kg : 0,
			bmr,
			kind: weightGoal?.kind ?? "maintain",
			targetWeightKg: weightGoal ? weightGoal.target_weight / 1000 : null,
			targetDate: weightGoal?.target_date ?? null,
			now,
		});

		const fromProfile =
			activeMacroProfile && activeMacroProfile.checkpoints.length > 0
				? interpolateProfile(activeMacroProfile.checkpoints, safe.target)
				: null;
		const macros =
			fromProfile ??
			scaleMacros(
				{ calories, protein, carbs, fat },
				safe.target,
			);

		addNewGoal({
			calories: macros.calories,
			protein: macros.protein,
			carbs: macros.carbs,
			fat: macros.fat,
			maintenance,
			source: "adaptive",
			timestamp,
		});
	}

	function addGoal() {
		// The calories column was never written: the app derived the number from macros and
		// left the column at 0. Anything reading the goal row — the adaptive changelog, the
		// weekly job — needs it stored.
		addNewGoal({ calories, protein, carbs, fat });
	}

	if (nutriGoalsLoading) return <H1>Loading</H1>;

	const setters = { protein: setProtein, carbs: setCarbs, fat: setFat };

	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple title="Goals" />

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.page}
				nestedScrollEnabled
				keyboardShouldPersistTaps="handled"
			>
				{/* The target, answering "what does this add up to" before any input. */}
				<View style={styles.hero}>
					<H6 style={{ color: colors.inactive }}>Daily target</H6>
					<View style={styles.heroValue}>
						<H1>{displayedCalories}</H1>
						<H4 style={{ color: colors.inactive }}>kcal</H4>
					</View>
					<MacroBar
						protein={protein}
						carbs={carbs}
						fat={fat}
						height={20}
					/>
				</View>

				{/* Manual vs adaptive. The changelog is what makes an adapting number
				    trustworthy rather than magic: it says what moved and why. */}
				<View style={styles.sourceCard}>
					<View style={styles.sourceRow}>
						<H4>Calorie target</H4>
						<View style={styles.sourceSegmented}>
							{(["manual", "adaptive"] as const).map((option) => (
								<Pressable
									key={option}
									accessibilityRole="button"
									accessibilityState={{
										selected: (currentGoal?.source ?? "manual") === option,
									}}
									disabled={option === "adaptive" && !maintenanceUnlocked}
									onPress={() => setSource(option)}
									style={[
										styles.sourceSegment,
										(currentGoal?.source ?? "manual") === option &&
											styles.sourceSegmentActive,
										option === "adaptive" && !maintenanceUnlocked && {
											opacity: 0.4,
										},
									]}
								>
									<H6
										style={{
											color:
												(currentGoal?.source ?? "manual") === option
													? colors.white
													: colors.inactive,
										}}
									>
										{option === "manual"
											? "Manual"
											: maintenanceUnlocked
												? "Adaptive"
												: "Adaptive · Pro"}
									</H6>
								</Pressable>
							))}
						</View>
					</View>
					<H6 style={{ color: colors.inactive }}>
						{(currentGoal?.source ?? "manual") === "adaptive"
							? changeSummary ??
								"Adjusts weekly from your own weigh-ins and food logs. It moves at most once a week, and never silently."
							: "The number you set. It stays put until you change it."}
					</H6>
				</View>

				<H4 style={styles.sectionTitle}>Macros</H4>

				{(currentGoal?.source ?? "manual") === "adaptive" ? (
					<View style={styles.wheelCard}>
						<H6 style={{ color: colors.inactive }}>
							Your macros come from the algorithm: the calorie target times
							activity, then your active macro profile turns it into grams. They
							move with the target each week.
						</H6>
						{[
							{ label: "PROTEIN", value: currentGoal?.protein ?? protein, color: colors.protein },
							{ label: "CARBS", value: currentGoal?.carbs ?? carbs, color: colors.carbs },
							{ label: "FAT", value: currentGoal?.fat ?? fat, color: colors.fat },
						].map((macro) => (
							<View key={macro.label} style={styles.adaptiveRow}>
								<View style={[styles.pill, { backgroundColor: macro.color }]} />
								<H4_Bold style={styles.columnName}>{macro.label}</H4_Bold>
								<H4 style={{ color: colors.primary }}>{macro.value} g</H4>
							</View>
						))}
						<H6 style={{ color: colors.inactive }}>
							Switch to Manual to set these yourself.
						</H6>
					</View>
				) : (
					<View style={styles.wheelCard}>
						{COLUMNS.map((column) => (
							<MacroStepper
								key={column.key}
								label={column.label}
								color={column.color}
								max={column.max}
								value={{ protein, carbs, fat }[column.key]}
								onChange={setters[column.key]}
							/>
						))}
					</View>
				)}

				{/* Macro profiles: the curve that turns calories into macros. It is a Pro
				    surface, so the trailing label says so instead of inviting a tap. */}
				<Pressable
					onPress={() => router.push("/(tabs)/(profile)/macroProfile")}
					accessibilityRole="button"
					accessibilityLabel="Macro profiles"
					style={styles.unitCard}
				>
					<View style={{ flex: 1 }}>
						<H4>Macro profiles</H4>
						<H6 style={{ color: colors.inactive }}>
							{macroProfileSummary}
						</H6>
					</View>
					<H6 style={{ color: colors.primary }}>
						{maintenanceUnlocked ? "Manage" : "Pro"}
					</H6>
				</Pressable>

				{/* Maintenance: what the adaptive target is derived from, and the number the
				    body profile exists to seed. */}
				<Pressable
					onPress={() => router.push("/(tabs)/(profile)/maintenance")}
					accessibilityRole="button"
					accessibilityLabel="How maintenance is estimated"
					style={styles.unitCard}
				>
					<View style={{ flex: 1 }}>
						<H4>Maintenance</H4>
						<H6 style={{ color: colors.inactive }}>
							{maintenanceSummary}
						</H6>
					</View>
					<H6 style={{ color: colors.primary }}>Details</H6>
				</Pressable>

				{/* Weight goal lives on its own screen: its target picker is a wheel, and a
				    wheel is a FlatList, which cannot be nested in a scrolling page. */}
				<Pressable
					onPress={() => router.push("/(tabs)/(profile)/weightGoal")}
					accessibilityRole="button"
					accessibilityLabel="Edit weight goal"
					style={styles.unitCard}
				>
					<View style={{ flex: 1 }}>
						<H4>Weight goal</H4>
						<H6 style={{ color: colors.inactive }}>
							{weightGoalSummary}
						</H6>
					</View>
					<H6 style={{ color: colors.primary }}>
						{weightGoal ? "Change" : "Set"}
					</H6>
				</Pressable>

				{/* Height, birth year, sex and activity: only a prior for maintenance
				    calories, so it sits next to the goal it feeds. */}
				<Pressable
					onPress={() => router.push("/(tabs)/(profile)/bodyProfile")}
					accessibilityRole="button"
					accessibilityLabel="Edit body profile"
					style={styles.unitCard}
				>
					<View style={{ flex: 1 }}>
						<H4>Body profile</H4>
						<H6 style={{ color: colors.inactive }}>
							{bodyProfileSummary}
						</H6>
					</View>
					<H6 style={{ color: colors.primary }}>
						{bodyProfileComplete ? "Change" : "Set"}
					</H6>
				</Pressable>

				{/* Display preference, saved on tap — it is not a goal, so it does not
				    wait for Apply. Storage is always grams; this only changes what is
				    shown, everywhere at once. */}
				<View style={styles.unitCard}>
					<View style={{ flex: 1 }}>
						<H4>Units</H4>
						<H6 style={{ color: colors.inactive }}>
							Body weight is shown in this unit.
						</H6>
					</View>
					<View style={styles.segmented}>
						{(["lb", "kg"] as WeightUnit[]).map((option) => (
							<Pressable
								key={option}
								onPress={() => setUnit(option)}
								accessibilityRole="button"
								accessibilityState={{ selected: unit === option }}
								style={[
									styles.segment,
									unit === option && styles.segmentActive,
								]}
							>
								<H5_SemiBold
									style={{
										color:
											unit === option
												? colors.white
												: colors.inactive,
									}}
								>
									{option}
								</H5_SemiBold>
							</Pressable>
						))}
					</View>
				</View>

				<View style={{ flex: 1 }} />

				<PrimaryButton onPress={addGoal}>Apply</PrimaryButton>
			</ScrollView>
		</View>
	);
};

export default goals;

const styles = StyleSheet.create({
	page: {
		// Deliberately not `flex: 1`: on a ScrollView's content container that pins the
		// content to the viewport height, which is exactly how a page stops scrolling.
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 20,
		gap: 20,
	},
	hero: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 20,
		gap: 8,
	},
	heroValue: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 6,
	},
	stepperRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 6,
	},
	stepperLabel: {
		flex: 1,
	},
	stepperButton: {
		width: 36,
		height: 36,
		borderRadius: 8,
		backgroundColor: colors.off_white,
		alignItems: "center",
		justifyContent: "center",
	},
	stepperInput: {
		minWidth: 56,
		textAlign: "center",
		fontSize: 18,
		color: colors.black,
		backgroundColor: colors.off_white,
		borderRadius: 8,
		paddingVertical: 6,
		paddingHorizontal: 8,
	},
	adaptiveRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	sourceCard: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 10,
	},
	sourceRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	sourceSegmented: {
		flexDirection: "row",
		backgroundColor: colors.off_white,
		borderRadius: 8,
		padding: 3,
		gap: 3,
	},
	sourceSegment: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 6,
	},
	sourceSegmentActive: {
		backgroundColor: colors.primary,
	},
	sectionTitle: {
		marginTop: 4,
	},
	wheelCard: {
		backgroundColor: colors.white,
		borderRadius: 8,
		paddingVertical: 16,
		paddingHorizontal: 20,
		gap: 12,
	},
	wheels: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	column: {
		alignItems: "center",
		gap: 8,
		flex: 1,
	},
	columnTitle: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		height: 24,
	},
	columnName: {
		letterSpacing: 0.5,
	},
	pill: {
		width: 8,
		height: 20,
		borderRadius: 8,
	},
	columnLabel: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	hint: {
		color: colors.inactive,
		textAlign: "center",
	},
	unitCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
	},
	segmented: {
		flexDirection: "row",
		backgroundColor: colors.off_white,
		borderRadius: 8,
		padding: 3,
		gap: 3,
	},
	segment: {
		paddingHorizontal: 16,
		paddingVertical: 7,
		borderRadius: 6,
	},
	segmentActive: {
		backgroundColor: colors.primary,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 8,
	},
});
