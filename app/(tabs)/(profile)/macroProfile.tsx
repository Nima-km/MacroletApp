import { useSubscriptionState } from "@/api/hooks/useSubscriptionState";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import {
	PrimaryButton,
	SecondaryButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { H4, H5, H6 } from "@/components/UIComponents/Typography";
import { useGetNutriGoals } from "@/db/hooks/goals/nutritionGoal";
import {
	useDeleteMacroProfile,
	useGetMacroProfiles,
	useSaveMacroProfile,
	useSetActiveMacroProfile,
} from "@/db/hooks/macroProfile/useMacroProfile";
import { useGetProfile } from "@/db/hooks/profile/useProfile";
import { useGetLatestWeight } from "@/db/hooks/weight/useWeightLog";
import {
	MacroCheckpoint,
	MacroTargets,
	deriveCarbs,
	interpolateProfile,
	profileRange,
	sampleProfile,
} from "@/helper/macroProfile";
import {
	PRESET_LABELS,
	PRESET_ORDER,
	PresetKey,
	presetCheckpoints,
} from "@/helper/macroPresets";
import { toDisplay } from "@/helper/units";
import { colors } from "@/theme";
import {
	Canvas,
	Circle,
	DashPathEffect,
	Line,
	Path,
	RoundedRect,
	Skia,
	Text as SkText,
	useFont,
	vec,
} from "@shopify/react-native-skia";
import React, { useMemo, useState } from "react";
import {
	Alert,
	LayoutChangeEvent,
	Pressable,
	StyleSheet,
	View,
	useWindowDimensions,
	TextInput,
} from "react-native";

/**
 * Macro profiles.
 *
 * A profile is a curve, not a table: a calorie level goes in, protein / fat / carbohydrate
 * grams come out. Carbohydrate is never stored — it is whatever the calories leave after
 * protein and fat — so a checkpoint can never disagree with its own calorie target.
 *
 * The chart is the screen. Three lines leaving the lowest checkpoint and fanning apart as
 * calories climb; the handful of checkpoints underneath are the only things pinning that fan
 * down, which is why they are editable in place rather than on a screen of their own.
 */

/** The shape `useGetMacroProfiles` returns; named locally so helpers stay typeable. */
type Profile = {
	id: number;
	name: string;
	preset: string | null;
	active: boolean;
	checkpoints: MacroCheckpoint[];
};

type CheckpointForm = {
	/** Checkpoint being edited, or null while adding one. */
	index: number | null;
	calories: string;
	protein: string;
	fat: string;
	carbs: string;
};

const CHART_HEIGHT = 190;
const CHART_TOP = 10;
const CHART_BOTTOM = 10;
/** Wide enough for the max-grams label in the 10 pt font, which sits in this gutter. */
const CHART_LEFT = 40;
const CHART_RIGHT = 6;

/** The hairline WeightChart uses, kept identical so the two charts read as one family. */
const HAIRLINE = "rgba(46,34,28,0.06)";

const toNumber = (text: string) => {
	const value = Number(text);
	return Number.isFinite(value) ? value : 0;
};

/**
 * `profileRange` over the checkpoints that are calorie levels.
 *
 * A preset carries an origin at `(0, 0, 0)` so the curve is defined all the way down, but
 * zero is not a calorie target anyone eats at: printing "0–2,650 kcal" for a profile that
 * starts at 1,580 would misdescribe it.
 */
function curveRange(checkpoints: MacroCheckpoint[]): { from: number; to: number } {
	const levels = checkpoints.filter((checkpoint) => checkpoint.calories > 0);
	return profileRange(levels.length > 0 ? levels : checkpoints);
}

/** `1,580 kcal · 160 p / 60 f / 100 c` — the checkpoint in the one form it is stored in. */
function describeCheckpoint(checkpoint: MacroCheckpoint): string {
	const carbs = Math.round(deriveCarbs(checkpoint));
	return `${checkpoint.calories.toLocaleString()} kcal · ${checkpoint.protein} p / ${checkpoint.fat} f / ${carbs} c`;
}

/**
 * Axis maxima are read, not measured: round the top up to a whole 50 g.
 *
 * A coarser "1/2/5 × a power of ten" ceiling put 300 g of carbohydrate halfway up a 500 g
 * axis, which leaves the fan squashed into the bottom of its own chart.
 */
function gramCeiling(value: number): number {
	if (!Number.isFinite(value) || value <= 0) return 50;
	return Math.ceil(value / 50) * 50;
}

function verticalPath(x: number, top: number, bottom: number) {
	const path = Skia.Path.Make();
	path.moveTo(x, top);
	path.lineTo(x, bottom);
	return path;
}

export default function MacroProfileScreen() {
	// True while a finger is on the chart: the page must not scroll under it.
	const [scrubbing, setScrubbing] = useState(false);
	const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionState();
	const { data: profiles, isLoading } = useGetMacroProfiles();
	const save = useSaveMacroProfile();
	// Null means the form is closed. Typing a name opens it.
	const [newProfileName, setNewProfileName] = useState<string | null>(null);
	const [newCheckpoint, setNewCheckpoint] = useState({
		calories: "",
		protein: "",
		fat: "",
		carbs: "",
	});
	const activate = useSetActiveMacroProfile();
	const remove = useDeleteMacroProfile();
	const { data: latestWeight } = useGetLatestWeight();
	const { data: storedProfile } = useGetProfile();
	const { data: nutriGoals } = useGetNutriGoals();

	const [form, setForm] = useState<CheckpointForm | null>(null);

	// The gate is display-only: the data layer behind it is not gated at all, so a free user
	// simply never sees the page that would let them build a curve.
	const entitled = subscription?.entitled === true;
	const locked = !subscriptionLoading && !entitled;

	// A stored goal of 0 means "never set": the calories column was left at zero for years
	// while the app derived the number from macros.
	const goalCalories = nutriGoals?.[0]?.calories ?? 0;
	const targetCalories = goalCalories > 0 ? goalCalories : null;

	// Presets scale with body mass, which is why they cannot be generated without both a
	// weigh-in and a height.
	const weightLb = latestWeight ? toDisplay(latestWeight.weight, "lb") : null;
	const heightCm = storedProfile?.heightCm ?? null;
	const canGenerate =
		weightLb !== null && weightLb > 0 && heightCm !== null && heightCm > 0;

	const active = profiles?.find((profile) => profile.active) ?? null;

	/**
	 * Copy the active profile into a new, named, editable one.
	 *
	 * `preset: null` is what makes it a custom profile: presets can be regenerated, so they
	 * cannot be deleted; this can. Seeding from the active profile means the new curve is
	 * already valid and already meaningful for this body.
	 */
	/**
	 * A new profile is a name and a first checkpoint.
	 *
	 * It is not copied from the active profile any more: an empty profile cannot answer
	 * anything, and a copy is not a new profile — it is the old one under another name.
	 */
	function createProfile() {
		const name = (newProfileName ?? "").trim();
		if (name.length === 0) return;

		const calories = Math.round(toNumber(newCheckpoint.calories));
		const protein = Math.round(toNumber(newCheckpoint.protein));
		const fat = Math.round(toNumber(newCheckpoint.fat));
		const carbs = Math.round(toNumber(newCheckpoint.carbs));

		if (!(calories > 0) || protein < 0 || fat < 0 || carbs < 0) return;

		save.mutate(
			{
				name,
				preset: null,
				checkpoints: [{ calories, protein, fat }],
			},
			{
				onSuccess: () => {
					setNewProfileName(null);
					setNewCheckpoint({
						calories: "",
						protein: "",
						fat: "",
						carbs: "",
					});
				},
			},
		);
	}

	// Live arithmetic for the first checkpoint, so the entry is checked before it is saved.
	const newCheckpointMatch = (() => {
		const calories = toNumber(newCheckpoint.calories);
		const protein = toNumber(newCheckpoint.protein);
		const fat = toNumber(newCheckpoint.fat);
		const carbs = toNumber(newCheckpoint.carbs);
		if (!(calories > 0)) return "Set a calorie level and its macros.";
		const derived = 4 * protein + 4 * carbs + 9 * fat;
		const gap = Math.round(derived - calories);
		if (Math.abs(gap) <= 10) return `Matches ${Math.round(calories)} kcal.`;
		return `${Math.round(derived)} kcal from macros — ${gap > 0 ? "+" : ""}${gap} against the target.`;
	})();

	function addPreset(preset: PresetKey) {
		if (weightLb === null || heightCm === null) return;
		const checkpoints = presetCheckpoints(preset, weightLb, heightCm);
		if (checkpoints.length === 0) return;
		save.mutate({ name: PRESET_LABELS[preset], preset, checkpoints });
	}

	function openForm(profile: Profile, index: number | null) {
		if (index === null) {
			// Start the form at the calorie target in force, so the first checkpoint lands
			// where the person actually eats rather than at an arbitrary round number.
			const suggestion = targetCalories ?? curveRange(profile.checkpoints).from;
			setForm({
				index: null,
				calories: suggestion > 0 ? String(Math.round(suggestion)) : "",
				protein: "",
				fat: "",
				carbs: "",
			});
			return;
		}

		const checkpoint = profile.checkpoints[index];
		if (!checkpoint) return;
		setForm({
			index,
			calories: String(checkpoint.calories),
			protein: String(checkpoint.protein),
			fat: String(checkpoint.fat),
			// Pre-filled with the carbs this checkpoint already implies, so an edit starts
			// consistent instead of showing a gap the user did not create.
			carbs: String(Math.round(deriveCarbs(checkpoint))),
		});
	}

	function commitForm() {
		if (!active || !form) return;
		const calories = Math.round(toNumber(form.calories));
		const protein = Math.round(toNumber(form.protein));
		const fat = Math.round(toNumber(form.fat));
		// One checkpoint per calorie level: two rows at the same calories would give the
		// curve two answers at that level, so a re-save replaces rather than duplicates.
		const others = active.checkpoints.filter(
			(checkpoint, index) => index !== form.index,
		);
		const checkpoints = [
			...others.filter((checkpoint) => checkpoint.calories !== calories),
			{ calories, protein, fat },
		].sort((a, b) => a.calories - b.calories);
		save.mutate({
			id: active.id,
			name: active.name,
			preset: active.preset,
			checkpoints,
		});
		setForm(null);
	}

	/**
	 * Remove one checkpoint.
	 *
	 * The last one cannot go: a profile with no points has no curve and cannot produce
	 * macros, so deleting it would leave an active profile that silently returns nothing.
	 */
	function deleteCheckpoint(calories: number) {
		if (!active) return;
		if (active.checkpoints.length <= 1) {
			Alert.alert(
				"Keep one checkpoint",
				"A profile needs at least one point to produce any macros. Add another before removing this one.",
			);
			return;
		}
		Alert.alert("Delete checkpoint?", `${calories.toLocaleString()} kcal will be removed.`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					save.mutate({
						id: active.id,
						name: active.name,
						preset: active.preset,
						checkpoints: active.checkpoints.filter(
							(checkpoint) => checkpoint.calories !== calories,
						),
					});
					if (form?.index !== null && form !== null) setForm(null);
				},
			},
		]);
	}

	function confirmDelete(profile: Profile) {
		Alert.alert("Delete profile?", `"${profile.name}" will be removed.`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					setForm(null);
					remove.mutate(profile.id);
				},
			},
		]);
	}

	// Everything the open form can tell the user about itself. A mismatch is shown, never
	// enforced: only an impossible checkpoint (negative carbs, no calories) blocks a save.
	const formCalories = toNumber(form?.calories ?? "");
	const formProtein = toNumber(form?.protein ?? "");
	const formFat = toNumber(form?.fat ?? "");
	const formCarbs = toNumber(form?.carbs ?? "");
	const derivedCalories = 4 * formProtein + 4 * formCarbs + 9 * formFat;
	const difference = derivedCalories - formCalories;
	const matchesTarget = formCalories > 0 && Math.abs(difference) <= 10;
	const carbsFromMacros = deriveCarbs({
		calories: formCalories,
		protein: formProtein,
		fat: formFat,
	});
	const canSave = formCalories > 0 && formCarbs >= 0 && carbsFromMacros >= 0;
	const formProblem =
		formCalories <= 0
			? "Enter target calories above zero."
			: formCarbs < 0 || carbsFromMacros < 0
				? "Protein and fat already exceed the calories — lower one of them."
				: null;
	const differenceLabel = matchesTarget
		? "matches"
		: `${Math.abs(difference).toLocaleString()} kcal ${
				difference > 0 ? "over" : "under"
			}`;

	return (
		<KeyboardAware scrollEnabled={!scrubbing}>
			<HeaderSimple title="Macro profiles" />
			<View style={styles.page}>
				{locked ? (
					<View style={styles.card}>
						<H4>Macro profiles are a Pro feature</H4>
						<H6 style={styles.muted}>
							A profile turns a calorie target into protein, fat and
							carbohydrate grams. That split is part of the Pro algorithm —
							logging, your goals and the charts stay free.
						</H6>
					</View>
				) : (
					<>
						{/* A profile of your own. Seeded from the active one, because an empty
						    form would ask the user to invent two calorie checkpoints from
						    nothing before anything useful can be computed. */}
						<View style={styles.card}>
							<H4>New profile</H4>
							{newProfileName === null ? (
								<>
									<H6 style={styles.muted}>
										Make your own curve. Give it a name and its first
										checkpoint — a calorie level with the macros that hit it —
										and add more points once it exists.
									</H6>
									<SecondaryButton onPress={() => setNewProfileName("")}>
										Create a profile
									</SecondaryButton>
								</>
							) : (
								<>
									<TextInput
										value={newProfileName}
										onChangeText={setNewProfileName}
										placeholder="Name, e.g. Pre-contest"
										placeholderTextColor={colors.inactive}
										style={styles.nameInput}
										autoFocus
										returnKeyType="done"
										onSubmitEditing={() => createProfile()}
									/>
									<View style={styles.form}>
										<H6 style={styles.muted}>First checkpoint</H6>
										<FormInputNumber
											value={newCheckpoint.calories}
											unit="kcal"
											onChangeText={(text) =>
												setNewCheckpoint((current) => ({
													...current,
													calories: text,
												}))
											}
										/>
										<View style={styles.macroInputs}>
											<View style={styles.macroField}>
												<H6 style={styles.muted}>Protein</H6>
												<FormInputNumber
													value={newCheckpoint.protein}
													unit="g"
													onChangeText={(text) =>
														setNewCheckpoint((current) => ({
															...current,
															protein: text,
														}))
													}
												/>
											</View>
											<View style={styles.macroField}>
												<H6 style={styles.muted}>Carbs</H6>
												<FormInputNumber
													value={newCheckpoint.carbs}
													unit="g"
													onChangeText={(text) =>
														setNewCheckpoint((current) => ({
															...current,
															carbs: text,
														}))
													}
												/>
											</View>
											<View style={styles.macroField}>
												<H6 style={styles.muted}>Fat</H6>
												<FormInputNumber
													value={newCheckpoint.fat}
													unit="g"
													onChangeText={(text) =>
														setNewCheckpoint((current) => ({
															...current,
															fat: text,
														}))
													}
												/>
											</View>
										</View>
										<H6 style={styles.muted}>{newCheckpointMatch}</H6>
										<View style={styles.formActions}>
											<SecondaryButton
												onPress={() => {
													setNewProfileName(null);
													setNewCheckpoint({
														calories: "",
														protein: "",
														fat: "",
														carbs: "",
													});
												}}
												style={styles.flexButton}
											>
												Cancel
											</SecondaryButton>
											<PrimaryButton
												disabled={newProfileName.trim().length === 0}
												style={[
													styles.flexButton,
													{
														opacity:
															newProfileName.trim().length === 0
																? 0.5
																: 1,
													},
												]}
												onPress={() => createProfile()}
											>
												Create
											</PrimaryButton>
										</View>
									</View>
								</>
							)}
						</View>

						{/* Presets: snapshots built from the body, not formulas that keep
						    rewriting themselves. "Added" is a state, not an action. */}
						<View style={styles.card}>
							<H4>Presets</H4>
							<H6 style={styles.muted}>
								Generated from your latest weigh-in and your height.
							</H6>
							{PRESET_ORDER.map((preset) => {
								const added =
									profiles?.some(
										(profile) => profile.preset === preset,
									) ?? false;
								const disabled = added || !canGenerate;
								return (
									<View key={preset} style={styles.presetRow}>
										<H5 style={styles.presetName}>
											{PRESET_LABELS[preset]}
										</H5>
										<Pressable
											disabled={disabled}
											onPress={() => addPreset(preset)}
											accessibilityRole="button"
											accessibilityState={{ disabled }}
											accessibilityLabel={`Add the ${PRESET_LABELS[preset]} preset`}
											style={[
												styles.presetAction,
												disabled && styles.presetActionOff,
											]}
										>
											<H6
												style={{
													color: added
														? colors.inactive
														: canGenerate
															? colors.primary
															: colors.inactive,
												}}
											>
												{added ? "Added" : "Add"}
											</H6>
										</Pressable>
									</View>
								);
							})}
							{canGenerate ? null : (
								<H6 style={styles.muted}>
									Log a weigh-in and set your height first.
								</H6>
							)}
						</View>

						{/* The curve that is in force. Everything it shows — including the
						    scrubber's readout — is painted in the canvas: on Android a Skia
						    canvas is a SurfaceView and would cover a React view over it. */}
						{active ? (
							<View style={styles.card}>
								<FanChart
									onScrubActiveChange={setScrubbing}
									checkpoints={active.checkpoints}
									targetCalories={targetCalories}
								/>
							</View>
						) : null}

						{isLoading ? (
							<View style={styles.card}>
								<H5 style={styles.muted}>Loading your profiles…</H5>
							</View>
						) : profiles && profiles.length > 0 ? (
							profiles.map((profile) => {
								const range = curveRange(profile.checkpoints);
								const targets =
									targetCalories !== null
										? interpolateProfile(
												profile.checkpoints,
												targetCalories,
											)
										: null;
								return (
									<View
										key={profile.id}
										style={[
											styles.card,
											profile.active && styles.activeCard,
										]}
									>
										<View style={styles.profileRow}>
											<Pressable
												onPress={() => {
													setForm(null);
													if (!profile.active) {
														activate.mutate(
															profile.id,
														);
													}
												}}
												accessibilityRole="button"
												accessibilityState={{
													selected: profile.active,
												}}
												accessibilityLabel={
													profile.active
														? `${profile.name}, active`
														: `Make ${profile.name} the active profile`
												}
												style={styles.profileHeader}
											>
												<View style={styles.nameRow}>
													<H4>{profile.name}</H4>
													{profile.active ? (
														<H6
															style={
																styles.activeLabel
															}
														>
															Active
														</H6>
													) : null}
												</View>
												{profile.checkpoints.length > 0 ? (
													<H6 style={styles.muted}>
														{`${range.from.toLocaleString()}–${range.to.toLocaleString()} kcal`}
													</H6>
												) : (
													<H6 style={styles.muted}>
														No checkpoints yet
													</H6>
												)}
												{targets && targetCalories !== null ? (
													<H6 style={styles.muted}>
														{`${targets.protein} p / ${targets.fat} f / ${targets.carbs} c at ${targetCalories.toLocaleString()} kcal`}
													</H6>
												) : null}
											</Pressable>
											{profile.preset === null ? (
												<Pressable
													onPress={() =>
														confirmDelete(profile)
													}
													accessibilityRole="button"
													accessibilityLabel={`Delete ${profile.name}`}
													hitSlop={8}
												>
													<H6 style={styles.delete}>
														Delete
													</H6>
												</Pressable>
											) : null}
										</View>

										{profile.active ? (
											<View style={styles.checkpoints}>
												<H5>Checkpoints</H5>
												{profile.checkpoints.map(
													(checkpoint, index) => (
														<Pressable
															key={`${checkpoint.calories}-${index}`}
															onPress={() =>
																openForm(
																	profile,
																	index,
																)
															}
															accessibilityRole="button"
															accessibilityLabel={`Edit the checkpoint at ${checkpoint.calories} calories`}
															style={
																styles.checkpointRow
															}
														>
															<H6 style={{ flex: 1 }}>
																{describeCheckpoint(
																	checkpoint,
																)}
															</H6>
															<Pressable
																accessibilityRole="button"
																accessibilityLabel={`Delete the checkpoint at ${checkpoint.calories} calories`}
																onPress={() =>
																	deleteCheckpoint(
																		checkpoint.calories,
																	)
																}
																hitSlop={8}
															>
																<H6 style={{ color: colors.primary }}>
																	Delete
																</H6>
															</Pressable>
														</Pressable>
													),
												)}

												{form ? (
													<View style={styles.form}>
														<H6 style={styles.muted}>
															Target calories
														</H6>
														<FormInputNumber
															value={form.calories}
															unit="kcal"
															onChangeText={(
																text,
															) =>
																setForm({
																	...form,
																	calories:
																		text,
																})
															}
														/>
														<View
															style={
																styles.macroInputs
															}
														>
															<View
																style={
																	styles.macroField
																}
															>
																<H6
																	style={
																		styles.muted
																	}
																>
																	Protein
																</H6>
																<FormInputNumber
																	value={
																		form.protein
																	}
																	unit="g"
																	onChangeText={(
																		text,
																	) =>
																		setForm(
																			{
																				...form,
																				protein:
																					text,
																			},
																		)
																	}
																/>
															</View>
															<View
																style={
																	styles.macroField
																}
															>
																<H6
																	style={
																		styles.muted
																	}
																>
																	Fat
																</H6>
																<FormInputNumber
																	value={form.fat}
																	unit="g"
																	onChangeText={(
																		text,
																	) =>
																		setForm(
																			{
																				...form,
																				fat: text,
																			},
																		)
																	}
																/>
															</View>
															<View
																style={
																	styles.macroField
																}
															>
																<H6
																	style={
																		styles.muted
																	}
																>
																	Carbs
																</H6>
																<FormInputNumber
																	value={
																		form.carbs
																	}
																	unit="g"
																	onChangeText={(
																		text,
																	) =>
																		setForm(
																			{
																				...form,
																				carbs:
																					text,
																			},
																		)
																	}
																/>
															</View>
														</View>

														{/* 4·p + 4·c + 9·f against the
														    calories typed above. The gap is
														    information, not a failure. */}
														<H6
															style={
																matchesTarget
																	? styles.match
																	: styles.muted
															}
														>
															{formCalories > 0
																? `${derivedCalories.toLocaleString()} kcal · ${differenceLabel}`
																: `${derivedCalories.toLocaleString()} kcal`}
														</H6>
														{formProblem ? (
															<H6
																style={
																	styles.problem
																}
															>
																{formProblem}
															</H6>
														) : null}
														<View
															style={
																styles.formActions
															}
														>
															<SecondaryButton
																style={
																	styles.flexButton
																}
																onPress={() =>
																	setForm(null)
																}
															>
																Cancel
															</SecondaryButton>
															<PrimaryButton
																style={
																	styles.flexPrimary
																}
																disabled={
																	!canSave
																}
																onPress={
																	commitForm
																}
															>
																Save checkpoint
															</PrimaryButton>
														</View>
													</View>
												) : (
													<SecondaryButton
														onPress={() =>
															openForm(
																profile,
																null,
															)
														}
													>
														Add checkpoint
													</SecondaryButton>
												)}
											</View>
										) : null}
									</View>
								);
							})
						) : (
							<View style={styles.card}>
								<H6 style={styles.muted}>
									No profiles yet. Add a preset above to start.
								</H6>
							</View>
						)}
					</>
				)}
			</View>
		</KeyboardAware>
	);
}

/**
 * The fan: protein, fat and carbohydrate grams across the profile's calorie range.
 *
 * Straight segments rather than curves, for the same reason WeightChart uses them — a
 * smoothed line between two checkpoints can show a macro value the profile does not
 * actually produce anywhere. The x axis starts at zero rather than at the lowest
 * checkpoint, so a preset's origin is visible as the point all three lines leave.
 *
 * Touch scrubs the curve: a dashed rule, three dots and a readout, all painted inside the
 * canvas because on Android a Skia canvas is a SurfaceView and would cover a React view.
 */
function FanChart({
	checkpoints,
	targetCalories,
	onScrubActiveChange,
}: {
	checkpoints: MacroCheckpoint[];
	targetCalories: number | null;
	/** Told when a scrub starts and ends, so the page can stop scrolling under it. */
	onScrubActiveChange?: (active: boolean) => void;
}) {
	const font = useFont(require("@/assets/fonts/Metropolis-Regular.ttf"), 10);
	// The readout's two sizes. Drawn in the canvas, so they are Skia fonts rather than text.
	const calorieFont = useFont(require("@/assets/fonts/Metropolis-SemiBold.ttf"), 13);
	const macroFont = useFont(require("@/assets/fonts/Metropolis-Regular.ttf"), 11);
	const [width, setWidth] = useState(0);
	/**
	 * `onLayout` has proved unreliable here (it reported 0 inside this card), and a zero
	 * width silently turns the whole chart into an empty-state message. The window width
	 * minus the page and card padding is a guaranteed-good default; the measurement wins
	 * whenever it does arrive.
	 */
	const { width: windowWidth } = useWindowDimensions();
	const chartWidth = width > 0 ? width : Math.max(0, windowWidth - 40 - 32);
	const [scrubCalories, setScrubCalories] = useState<number | null>(null);

	const range = curveRange(checkpoints);
	/**
	 * The domain starts at zero, not at the lowest checkpoint: a preset carries an origin at
	 * `(0, 0, 0)` so the fan actually converges to a point there. A hand-built profile
	 * without one simply holds its lowest values down to zero, which is what
	 * `interpolateProfile` answers below the first checkpoint.
	 */
	const domainFrom = 0;
	const domainTo = range.to;

	const samples = useMemo(
		() => sampleProfile(checkpoints, domainFrom, domainTo, 40),
		[checkpoints, domainTo],
	);

	const maxSample = useMemo(
		() =>
			samples.reduce(
				(max, sample) =>
					Math.max(max, sample.protein, sample.fat, sample.carbs),
				0,
			),
		[samples],
	);
	const maxGrams = useMemo(() => gramCeiling(maxSample), [maxSample]);

	const target =
		targetCalories !== null &&
		targetCalories >= range.from &&
		targetCalories <= range.to
			? targetCalories
			: null;

	const chart = useMemo(() => {
		if (samples.length < 2 || !(domainTo > domainFrom)) return null;
		const plotWidth = Math.max(0, chartWidth - CHART_LEFT - CHART_RIGHT);
		if (plotWidth <= 0) return null;
		const plotHeight = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;
		const x = (calories: number) =>
			CHART_LEFT +
			((calories - domainFrom) / (domainTo - domainFrom)) * plotWidth;
		const y = (grams: number) =>
			CHART_TOP + (1 - grams / maxGrams) * plotHeight;
		/**
		 * The inverse of `x`: the finger's position as a calorie level, clamped to the
		 * domain so a drag past either edge reads the edge rather than a number that has
		 * no line under it.
		 */
		const caloriesAt = (locationX: number) => {
			const t = (locationX - CHART_LEFT) / plotWidth;
			return (
				domainFrom +
				Math.min(1, Math.max(0, t)) * (domainTo - domainFrom)
			);
		};
		const line = (pick: (sample: MacroTargets) => number) => {
			const path = Skia.Path.Make();
			samples.forEach((sample, index) => {
				if (index === 0) path.moveTo(x(sample.calories), y(pick(sample)));
				else path.lineTo(x(sample.calories), y(pick(sample)));
			});
			return path;
		};

		const top = CHART_TOP;
		const floor = CHART_TOP + plotHeight;
		const crossing =
			target !== null ? interpolateProfile(checkpoints, target) : null;
		const crossingX = target !== null ? x(target) : 0;

		return {
			protein: line((sample) => sample.protein),
			fat: line((sample) => sample.fat),
			carbs: line((sample) => sample.carbs),
			left: CHART_LEFT,
			right: CHART_LEFT + plotWidth,
			top,
			floor,
			x,
			y,
			caloriesAt,
			targetPath: target !== null ? verticalPath(crossingX, top, floor) : null,
			crossings: crossing
				? [
						{ key: "protein", color: colors.protein, cy: y(crossing.protein) },
						{ key: "fat", color: colors.fat, cy: y(crossing.fat) },
						{ key: "carbs", color: colors.carbs, cy: y(crossing.carbs) },
					].map((dot) => ({ ...dot, cx: crossingX }))
				: [],
		};
	}, [
		samples,
		domainFrom,
		domainTo,
		maxGrams,
		chartWidth,
		target,
		checkpoints,
	]);

	if (!chart) {
		return (
			<H6 style={styles.muted}>
				Add a second checkpoint at a different calorie level to see the curve.
			</H6>
		);
	}

	/**
	 * Grid values: a round step chosen so there are three or four rules, because one line at
	 * the ceiling says "the top is 300" and nothing about the space in between.
	 */
	const gridStep = maxGrams <= 150 ? 50 : maxGrams <= 400 ? 100 : 150;
	const gridValues: number[] = [];
	for (let grams = gridStep; grams <= maxGrams + 1e-6; grams += gridStep) {
		gridValues.push(grams);
	}

	/**
	 * Where the rule sits when nobody is touching the plot.
	 *
	 * The current calorie target, because that is the position the user most wants to read —
	 * it is the number the app is actually asking them to eat. Without a target (or with one
	 * outside the profile's range) it falls back to the end of the range, so it is never a
	 * line floating in the middle describing nothing.
	 */
	const parkAt =
		target !== null && target >= domainFrom && target <= domainTo ? target : domainTo;
	const scrubValue = scrubCalories ?? parkAt;
	const scrubTargets = interpolateProfile(checkpoints, scrubValue);
	const scrubX = chart.x(scrubValue);

	const onTouch = (locationX: number) => {
		setScrubCalories(chart.caloriesAt(locationX));
	};

	/**
	 * The readout, laid out here rather than inline in the JSX so its fonts can be measured
	 * once and the box placed against the dots it describes. `null` while not scrubbing.
	 */
	const tooltip = (() => {
		if (scrubCalories === null || !scrubTargets || !calorieFont || !macroFont) {
			return null;
		}
		const padding = 10;
		const titleText = `${Math.round(scrubCalories).toLocaleString()} kcal`;
		const rows = [
			{
				color: colors.protein,
				text: `${scrubTargets.protein} g protein`,
				cy: chart.y(scrubTargets.protein),
			},
			{
				color: colors.fat,
				text: `${scrubTargets.fat} g fat`,
				cy: chart.y(scrubTargets.fat),
			},
			{
				color: colors.carbs,
				text: `${scrubTargets.carbs} g carbs`,
				cy: chart.y(scrubTargets.carbs),
			},
		];
		const rowWidth = rows.reduce(
			(widest, row) => Math.max(widest, macroFont.getTextWidth(row.text) + 12),
			0,
		);
		const boxWidth =
			Math.max(calorieFont.getTextWidth(titleText), rowWidth) + padding * 2;
		const boxHeight = padding * 2 + 16 + rows.length * 15;
		const dotYs = rows.map((row) => row.cy);
		// Above the highest dot, or below the lowest one when the plot has no room above.
		const above = Math.min(...dotYs) - boxHeight - 12;
		const boxY =
			above >= 0
				? above
				: Math.min(CHART_HEIGHT - boxHeight, Math.max(...dotYs) + 12);
		// Kept inside the canvas: it is painted, so nothing can scroll it back into view.
		const boxX = Math.min(
			Math.max(0, width - boxWidth),
			Math.max(0, scrubX - boxWidth / 2),
		);
		return {
			titleText,
			titleFont: calorieFont,
			bodyFont: macroFont,
			rows,
			boxX,
			boxY,
			boxWidth,
			boxHeight,
			titleY: boxY + padding + 12,
		};
	})();

	return (
		<View style={styles.chart}>
			<View style={styles.legend}>
				{[
					{ label: "Protein", color: colors.protein },
					{ label: "Fat", color: colors.fat },
					{ label: "Carbs", color: colors.carbs },
				].map((item) => (
					<View key={item.label} style={styles.legendItem}>
						<View
							style={[
								styles.legendDot,
								{ backgroundColor: item.color },
							]}
						/>
						<H6 style={styles.muted}>{item.label}</H6>
					</View>
				))}
			</View>

			{/* The responder lives on the wrapper, not on pressables over the canvas: on
			    Android the canvas is a SurfaceView and covers anything laid on top of it. */}
			<View
				style={styles.chartCanvas}
				onLayout={(event: LayoutChangeEvent) =>
					setWidth(event.nativeEvent.layout.width)
				}
				onStartShouldSetResponderCapture={() => true}
				// Once the scrub has the gesture it keeps it: without this, the smallest
				// vertical drift lets the ScrollView claim the touch and the tooltip dies
				// mid-drag.
				onResponderTerminationRequest={() => false}
				onMoveShouldSetResponderCapture={() => true}
				onResponderGrant={(event) => {
					onScrubActiveChange?.(true);
					onTouch(event.nativeEvent.locationX);
				}}
				onResponderMove={(event) => onTouch(event.nativeEvent.locationX)}
				onResponderRelease={() => {
					setScrubCalories(null);
					onScrubActiveChange?.(false);
				}}
				onResponderTerminate={() => {
					setScrubCalories(null);
					onScrubActiveChange?.(false);
				}}
			>
				{chartWidth > 0 && font ? (
					<Canvas style={{ flex: 1 }}>
						{/* Only the top and bottom of the value range, and the max
						    label: a grid of rules would compete with the lines. */}
						{/* One rule per grid step, each labelled, plus the baseline. */}
						{gridValues.map((grams) => (
							<React.Fragment key={`grid-${grams}`}>
								<Line
									p1={vec(chart.left, chart.y(grams))}
									p2={vec(chart.right, chart.y(grams))}
									color={HAIRLINE}
									strokeWidth={1}
								/>
								<SkText
									x={CHART_LEFT - 8 - font.getTextWidth(`${gridStep} g`)}
									y={chart.y(grams) + 4}
									text={`${grams} g`}
									font={font}
									color={colors.inactive}
								/>
							</React.Fragment>
						))}
						<Line
							p1={vec(chart.left, chart.floor)}
							p2={vec(chart.right, chart.floor)}
							color={HAIRLINE}
							strokeWidth={1}
						/>


						<Path
							path={chart.protein}
							style="stroke"
							strokeWidth={2.5}
							color={colors.protein}
							strokeJoin="round"
						/>
						<Path
							path={chart.fat}
							style="stroke"
							strokeWidth={2.5}
							color={colors.fat}
							strokeJoin="round"
						/>
						<Path
							path={chart.carbs}
							style="stroke"
							strokeWidth={2.5}
							color={colors.carbs}
							strokeJoin="round"
						/>

						{/* Where today's target lands: one dashed rule and three dots,
						    so the chart answers "what do I eat at this number". */}
						{chart.targetPath ? (
							<Path
								path={chart.targetPath}
								style="stroke"
								strokeWidth={1}
								color={colors.inactive}
							>
								<DashPathEffect intervals={[3, 4]} />
							</Path>
						) : null}
						{chart.crossings.map((dot) => (
							<Circle
								key={dot.key}
								cx={dot.cx}
								cy={dot.cy}
								r={3}
								color={dot.color}
							/>
						))}

						{/* The scrubber: a dashed rule wherever the finger is, and three dots
						    read from `interpolateProfile` rather than from the sampled points,
						    so they sit exactly on the lines they mark. */}
						<Path
							path={verticalPath(scrubX, chart.top, chart.floor)}
							style="stroke"
							strokeWidth={1.5}
							color={colors.inactive}
						>
							<DashPathEffect intervals={[3, 4]} />
						</Path>
						{scrubTargets ? (
							<>
								<Circle
									cx={scrubX}
									cy={chart.y(scrubTargets.protein)}
									r={4}
									color={colors.protein}
								/>
								<Circle
									cx={scrubX}
									cy={chart.y(scrubTargets.fat)}
									r={4}
									color={colors.fat}
								/>
								<Circle
									cx={scrubX}
									cy={chart.y(scrubTargets.carbs)}
									r={4}
									color={colors.carbs}
								/>
							</>
						) : null}

						{/* Painted, not laid out: an RN tooltip over a Skia canvas is invisible
						    on Android. Hidden until there is a scrub to describe. */}
						{tooltip ? (
							<>
								<RoundedRect
									x={tooltip.boxX}
									y={tooltip.boxY}
									width={tooltip.boxWidth}
									height={tooltip.boxHeight}
									r={8}
									color={colors.white}
								/>
								<RoundedRect
									x={tooltip.boxX}
									y={tooltip.boxY}
									width={tooltip.boxWidth}
									height={tooltip.boxHeight}
									r={8}
									color={colors.light_gray}
									style="stroke"
									strokeWidth={1}
								/>
								<SkText
									x={tooltip.boxX + 10}
									y={tooltip.titleY}
									text={tooltip.titleText}
									font={tooltip.titleFont}
									color={colors.black}
								/>
								{tooltip.rows.map((row, index) => {
									const baseline =
										tooltip.titleY + 16 + index * 15;
									return (
										<React.Fragment key={row.text}>
											<Circle
												cx={tooltip.boxX + 13}
												cy={baseline - 4}
												r={3}
												color={row.color}
											/>
											<SkText
												x={tooltip.boxX + 22}
												y={baseline}
												text={row.text}
												font={tooltip.bodyFont}
												color={colors.medium_gray}
											/>
										</React.Fragment>
									);
								})}
							</>
						) : null}
					</Canvas>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		paddingHorizontal: 20,
		paddingBottom: 40,
		gap: 20,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 12,
		borderWidth: 1,
		borderColor: "transparent",
	},
	activeCard: {
		backgroundColor: colors.primary_bg,
		borderColor: colors.primary,
	},
	muted: {
		color: colors.inactive,
	},
	match: {
		color: colors.dark_green,
	},
	problem: {
		color: colors.error,
	},
	presetRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	presetName: {
		flex: 1,
	},
	presetAction: {
		backgroundColor: colors.primary_bg,
		borderRadius: 22,
		paddingHorizontal: 12,
		paddingVertical: 6,
		minWidth: 64,
		alignItems: "center",
	},
	presetActionOff: {
		backgroundColor: "transparent",
	},
	profileRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
	},
	profileHeader: {
		flex: 1,
		gap: 2,
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		flexWrap: "wrap",
	},
	activeLabel: {
		color: colors.primary,
	},
	delete: {
		color: colors.error,
	},
	checkpoints: {
		gap: 8,
	},
	checkpointRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 4,
	},
	form: {
		gap: 10,
	},
	macroInputs: {
		flexDirection: "row",
		gap: 8,
	},
	macroField: {
		flex: 1,
		gap: 4,
	},
	formActions: {
		flexDirection: "row",
		gap: 10,
	},
	flexButton: {
		flex: 1,
	},
	/** The primary label is longer than "Cancel"; it gets the room to stay on one line. */
	flexPrimary: {
		flex: 2,
	},
	chart: {
		gap: 8,
	},
	legend: {
		flexDirection: "row",
		gap: 16,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	legendDot: {
		width: 10,
		height: 10,
		borderRadius: 10,
	},
	pair: {
		flexDirection: "row",
		gap: 10,
	},
	pairItem: {
		flex: 1,
	},
	matchLine: {
		color: colors.inactive,
	},
	nameInput: {
		backgroundColor: colors.off_white,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		color: colors.black,
	},
	formButtons: {
		flexDirection: "row",
		gap: 10,
	},
	chartCanvas: {
		height: CHART_HEIGHT,
		// The canvas has no intrinsic width: a ScrollView's content container or a centred
		// card leaves it at zero, `plotWidth` goes negative and the chart silently falls back
		// to an empty-state message. Stretching it explicitly removes that dependency.
		alignSelf: "stretch",
		width: "100%",
	},
});
