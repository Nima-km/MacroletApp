import HeaderSimple from "@/components/navComponents/HeaderSimple";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { H4, H5, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import {
	ACTIVITY_LABELS,
	ActivityLevel,
	PROFILE_BOUNDS,
	ageFromBirthYear,
} from "@/helper/profile";
import { useGetProfile, useSaveProfile } from "@/db/hooks/profile/useProfile";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const HEIGHT = PROFILE_BOUNDS.heightCm;
const BIRTH_YEAR = PROFILE_BOUNDS.birthYear;

/** The conventional ladder, easiest to hardest — the order the labels are written in. */
const ACTIVITY_ORDER: ActivityLevel[] = [
	"sedentary",
	"light",
	"moderate",
	"very",
	"extra",
];

const SEXES: { key: "male" | "female"; label: string }[] = [
	{ key: "male", label: "Male" },
	{ key: "female", label: "Female" },
];

/** A draft is only a number once it parses; "" and "17." mid-keystroke do not. */
function parseNumber(text: string): number | null {
	const trimmed = text.trim();
	if (trimmed === "") return null;
	const value = Number(trimmed);
	return Number.isFinite(value) ? value : null;
}

/** Centimetres to the nearest inch, then split — the inverse of the save below. */
function toFeetInches(cm: number) {
	const total = Math.round(cm / 2.54);
	return { feet: Math.floor(total / 12), inches: total % 12 };
}

function fromFeetInches(feet: number, inches: number) {
	return Math.round((feet * 12 + inches) * 2.54);
}

/**
 * Body profile.
 *
 * Four numbers that are only ever a starting estimate. They live on their own screen
 * because height is either one field or two depending on the unit, and the whole point
 * of the page is to say out loud how little they are trusted once real data exists.
 *
 * The drafts are held locally and only committed when they are complete and plausible:
 * re-deriving the text from the store on every keystroke would delete the decimal point
 * or the leading digit from under the cursor.
 */
export default function BodyProfileScreen() {
	const { data: storedProfile } = useGetProfile();
	const { mutate: patch } = useSaveProfile();
	const profile = storedProfile ?? {};
	const hydrated = storedProfile !== undefined;
	const unit = useUnitStore((state) => state.unit);

	const [heightText, setHeightText] = useState("");
	const [feetText, setFeetText] = useState("");
	const [inchesText, setInchesText] = useState("");
	const [yearText, setYearText] = useState("");

	// Nothing to hydrate: the query fetches on mount, and `undefined` is "not answered yet".

	// Seed once per unit: the empty screen fills in when hydration lands, and switching
	// units re-reads the one stored centimetre value into whichever fields are shown.
	const seededFor = useRef<string | null>(null);
	useEffect(() => {
		if (!hydrated) return;
		if (seededFor.current === unit) return;
		seededFor.current = unit;

		const storedHeight = profile.heightCm;
		if (typeof storedHeight === "number" && Number.isFinite(storedHeight)) {
			setHeightText(String(Math.round(storedHeight)));
			const { feet, inches } = toFeetInches(storedHeight);
			setFeetText(String(feet));
			setInchesText(String(inches));
		}

		const storedYear = profile.birthYear;
		if (typeof storedYear === "number" && Number.isFinite(storedYear)) {
			setYearText(String(storedYear));
		}
	}, [hydrated, unit, profile.heightCm, profile.birthYear]);

	function commitHeightCm(text: string) {
		const value = parseNumber(text);
		if (value === null) return;
		if (value < HEIGHT.min || value > HEIGHT.max) return;
		const cm = Math.round(value);
		if (cm === profile.heightCm) return;
		patch({ heightCm: cm });
	}

	function commitImperial(feet: string, inches: string) {
		const feetValue = parseNumber(feet);
		const inchesValue = parseNumber(inches);
		if (feetValue === null || inchesValue === null) return;
		const cm = fromFeetInches(feetValue, inchesValue);
		if (cm < HEIGHT.min || cm > HEIGHT.max) return;
		if (cm === profile.heightCm) return;
		patch({ heightCm: cm });
	}

	function onHeightChange(text: string) {
		setHeightText(text);
		commitHeightCm(text);
	}

	function onFeetChange(text: string) {
		setFeetText(text);
		commitImperial(text, inchesText);
	}

	function onInchesChange(text: string) {
		setInchesText(text);
		commitImperial(feetText, text);
	}

	function onYearChange(text: string) {
		setYearText(text);
		const value = parseNumber(text);
		if (value === null) return;
		// Four digits is an attempt at a year, not a half-typed one: clamp it so the store
		// never holds something the estimator would have to reject.
		if (text.trim().length !== 4) return;
		const year = Math.min(
			BIRTH_YEAR.max,
			Math.max(BIRTH_YEAR.min, Math.round(value)),
		);
		if (year === profile.birthYear) return;
		patch({ birthYear: year });
	}

	const heightCm = unit === "kg" ? parseNumber(heightText) : null;
	const imperialCm = (() => {
		const feet = parseNumber(feetText);
		const inches = parseNumber(inchesText);
		if (feet === null || inches === null) return null;
		return fromFeetInches(feet, inches);
	})();
	const shownCm = unit === "kg" ? heightCm : imperialCm;
	const heightNote =
		shownCm !== null && (shownCm < HEIGHT.min || shownCm > HEIGHT.max)
			? `Height must be between ${HEIGHT.min} and ${HEIGHT.max} cm`
			: null;

	const yearValue = parseNumber(yearText);
	const yearInBounds =
		yearValue !== null &&
		yearValue >= BIRTH_YEAR.min &&
		yearValue <= BIRTH_YEAR.max;
	const yearNote =
		yearValue !== null && !yearInBounds
			? `Birth year must be between ${BIRTH_YEAR.min} and ${BIRTH_YEAR.max}`
			: null;
	// Age follows the draft while it is plausible, so the number answers the field.
	const ageYear = yearInBounds ? yearValue : profile.birthYear;
	const age =
		typeof ageYear === "number" && Number.isFinite(ageYear)
			? ageFromBirthYear(ageYear, new Date())
			: null;

	return (
		<KeyboardAware>
			<HeaderSimple title="Body profile" />

			<View style={styles.page}>
				<View style={styles.card}>
					<H4>Height</H4>
					{unit === "kg" ? (
						<FormInputNumber
							value={heightText}
							placeholder="178"
							unit="cm"
							viewStyle={styles.input}
							onChangeText={onHeightChange}
						/>
					) : (
						<View style={styles.imperialRow}>
							<View style={styles.imperialField}>
								<FormInputNumber
									value={feetText}
									placeholder="5"
									unit="ft"
									viewStyle={styles.input}
									onChangeText={onFeetChange}
								/>
							</View>
							<View style={styles.imperialField}>
								<FormInputNumber
									value={inchesText}
									placeholder="10"
									unit="in"
									viewStyle={styles.input}
									onChangeText={onInchesChange}
								/>
							</View>
						</View>
					)}
					{heightNote ? (
						<H6 style={styles.muted}>{heightNote}</H6>
					) : null}
				</View>

				<View style={styles.card}>
					<H4>Sex</H4>
					<View style={styles.segmented}>
						{SEXES.map((option) => (
							<Pressable
								key={option.key}
								onPress={() => patch({ sex: option.key })}
								accessibilityRole="button"
								accessibilityState={{
									selected: profile.sex === option.key,
								}}
								style={[
									styles.segment,
									profile.sex === option.key && styles.segmentActive,
								]}
							>
								<H5_SemiBold
									style={{
										color:
											profile.sex === option.key
												? colors.white
												: colors.inactive,
									}}
								>
									{option.label}
								</H5_SemiBold>
							</Pressable>
						))}
					</View>
				</View>

				<View style={styles.card}>
					<H4>Birth year</H4>
					<FormInputNumber
						value={yearText}
						placeholder="1990"
						viewStyle={styles.input}
						onChangeText={onYearChange}
					/>
					{age !== null ? (
						<H6 style={styles.muted}>{age} years old</H6>
					) : null}
					{yearNote ? <H6 style={styles.muted}>{yearNote}</H6> : null}
				</View>

				<View style={styles.card}>
					<H4>Activity</H4>
					<View style={styles.activityList}>
						{ACTIVITY_ORDER.map((level) => {
							const active = profile.activity === level;
							return (
								<Pressable
									key={level}
									onPress={() => patch({ activity: level })}
									accessibilityRole="button"
									accessibilityState={{ selected: active }}
									style={[
										styles.activityRow,
										active && styles.activityRowActive,
									]}
								>
									<H5
										style={{
											color: active
												? colors.primary
												: colors.medium_gray,
										}}
									>
										{ACTIVITY_LABELS[level]}
									</H5>
								</Pressable>
							);
						})}
					</View>
				</View>

				<View style={styles.card}>
					<H6 style={[styles.muted, styles.explanation]}>
						These four things are only here to give a first estimate of
						maintenance calories, before there is enough of your own data to
						work from. Once enough weigh-ins and food logs have built up, the
						app estimates from those measurements instead: how much any one
						person's metabolism, daily movement and logging differ from a
						formula matters far more than the formula does.
					</H6>
				</View>
			</View>
		</KeyboardAware>
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
	},
	input: {
		backgroundColor: colors.off_white,
	},
	imperialRow: {
		flexDirection: "row",
		gap: 12,
	},
	imperialField: {
		flex: 1,
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
	activityList: {
		gap: 8,
	},
	activityRow: {
		backgroundColor: colors.off_white,
		borderWidth: 1,
		borderColor: "transparent",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	activityRowActive: {
		backgroundColor: colors.primary_bg,
		borderColor: colors.primary,
	},
	muted: {
		color: colors.inactive,
	},
	explanation: {
		lineHeight: 19,
	},
});
