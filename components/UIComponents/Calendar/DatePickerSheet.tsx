import ArrowLeft from "@/assets/svg/chevron-left.svg";
import ArrowRight from "@/assets/svg/chevron-right.svg";
import { colors } from "@/theme";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { PrimaryButton, SecondaryButton } from "../Buttons/Button";
import { H3, H4, H5_SemiBold, H6 } from "../Typography";
import TimeWheel from "./TimeWheel";

const WEEK_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const WEEK_DAYS_LONG = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const MONTHS_LONG = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
// A half-day runs 12, 1, 2 ... 11 — midnight and noon are the *first* hour of AM and
// PM respectively, not the last. Ordering the wheel that way also makes the index a
// plain `hours % 12` instead of a special case for 0.
const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

type Props = {
	visible: boolean;
	value: Date;
	/** Called once, on Done. Cancel discards. */
	onChange: (date: Date) => void;
	onClose: () => void;
};

function sameDay(a: Date, b: Date) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/**
 * Date and time, in one sheet.
 *
 * Rebuilt around the wheel rather than bolted onto it: the calendar is a compact grid
 * rather than the dominant element, the wheels sit under a divider with their own
 * label, and the sheet has a header and a footer so it reads as a piece rather than a
 * floating block.
 *
 * Edits apply to a draft. Nothing changes until Done, so Cancel is a real option and
 * tapping outside no longer half-edits a log.
 */
export default function DatePickerSheet({
	visible,
	value,
	onChange,
	onClose,
}: Props) {
	const [draft, setDraft] = useState(value);
	const [month, setMonth] = useState(
		() => new Date(value.getFullYear(), value.getMonth(), 1),
	);
	const wasVisible = useRef(false);

	// Resync when the sheet opens, not on every render: editing the draft must not be
	// undone by the value prop it was seeded from.
	useEffect(() => {
		if (visible && !wasVisible.current) {
			setDraft(value);
			setMonth(new Date(value.getFullYear(), value.getMonth(), 1));
		}
		wasVisible.current = visible;
	}, [visible, value]);

	const today = useMemo(() => new Date(), []);
	// 12 -> 0, 1 -> 1, ... 11 -> 11. `11 % 12` is 11, and midnight is 0 -> 0.
	const hourIndex = draft.getHours() % 12;
	const minuteIndex = draft.getMinutes();
	const isPM = draft.getHours() >= 12;

	const days = useMemo(() => {
		const year = month.getFullYear();
		const monthIndex = month.getMonth();
		const leading = new Date(year, monthIndex, 1).getDay();
		const count = new Date(year, monthIndex + 1, 0).getDate();

		const cells: (number | null)[] = Array(leading).fill(null);
		for (let day = 1; day <= count; day++) cells.push(day);
		while (cells.length % 7 !== 0) cells.push(null);
		return cells;
	}, [month]);

	function setTime(
		nextHourIndex: number,
		nextMinuteIndex: number,
		nextPM: boolean,
	) {
		// Index 0 is the "12" row; the rest are their own hour. 12 AM is hour 0 and
		// 12 PM is hour 12, which is what `% 12` does to both.
		const hour12 = nextHourIndex === 0 ? 12 : nextHourIndex;
		const hour24 = (hour12 % 12) + (nextPM ? 12 : 0);
		const next = new Date(draft);
		next.setHours(hour24, nextMinuteIndex, 0, 0);
		setDraft(next);
	}

	function pickDay(day: number) {
		const next = new Date(draft);
		next.setFullYear(month.getFullYear(), month.getMonth(), day);
		setDraft(next);
	}

	function shiftMonth(delta: number) {
		setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
	}

	function jumpToNow() {
		const now = new Date();
		setDraft(now);
		setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
	}

	const relative = sameDay(draft, today)
		? "Today"
		: WEEK_DAYS_LONG[draft.getDay()];
	const subtitle = `${WEEK_DAYS_LONG[draft.getDay()]}, ${draft.getDate()} ${
		MONTHS_LONG[draft.getMonth()]
	} ${draft.getFullYear()}`;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={styles.root}>
				{/* Backdrop and card are siblings: a card inside the dismiss Pressable has to
				    fight it for touches, and a scrollable inside one loses its drag. */}
				<Pressable style={styles.backdrop} onPress={onClose} />
				<View pointerEvents="box-none" style={styles.center}>
					<View style={styles.card}>
						<View style={styles.header}>
							<View style={{ flex: 1, gap: 2 }}>
								<H3>{relative}</H3>
								<H6 style={{ color: colors.inactive }}>{subtitle}</H6>
							</View>
							<Pressable onPress={jumpToNow} accessibilityRole="button">
								<H6 style={{ color: colors.primary }}>Now</H6>
							</Pressable>
						</View>

						<View style={styles.monthRow}>
							<Pressable
								onPress={() => shiftMonth(-1)}
								accessibilityRole="button"
								accessibilityLabel="Previous month"
								style={styles.chevron}
							>
								<ArrowLeft color={colors.black} width={20} height={20} />
							</Pressable>
							<H4>
								{MONTHS_LONG[month.getMonth()]} {month.getFullYear()}
							</H4>
							<Pressable
								onPress={() => shiftMonth(1)}
								accessibilityRole="button"
								accessibilityLabel="Next month"
								style={styles.chevron}
							>
								<ArrowRight color={colors.black} width={20} height={20} />
							</Pressable>
						</View>

						<View style={styles.grid}>
							{WEEK_DAYS.map((label) => (
								<View key={label} style={styles.dayCell}>
									<H6 style={{ color: colors.inactive }}>{label}</H6>
								</View>
							))}
							{days.map((day, cellIndex) => {
								if (day === null) {
									return (
										<View
											key={`blank-${cellIndex}`}
											style={styles.dayCell}
										/>
									);
								}
								const cellDate = new Date(
									month.getFullYear(),
									month.getMonth(),
									day,
								);
								const selected = sameDay(cellDate, draft);
								const isToday = sameDay(cellDate, today);
								return (
									<Pressable
										key={`day-${day}`}
										onPress={() => pickDay(day)}
										accessibilityRole="button"
										style={styles.dayCell}
									>
										<View
											style={[
												styles.dayDot,
												isToday && !selected && styles.dayDottoday,
												selected && styles.dayDotSelected,
											]}
										>
											<H5_SemiBold
												style={{
													color: selected
														? colors.white
														: colors.black,
												}}
											>
												{day}
											</H5_SemiBold>
										</View>
									</Pressable>
								);
							})}
						</View>

						<View style={styles.divider} />

						<H6 style={{ color: colors.inactive, letterSpacing: 1 }}>
							TIME
						</H6>
						<View style={styles.wheels}>
							<TimeWheel
								values={HOURS}
								index={hourIndex}
								onIndexChange={(next) => setTime(next, minuteIndex, isPM)}
								width={64}
								visibleRows={3}
							/>
							<TimeWheel
								values={MINUTES}
								index={minuteIndex}
								onIndexChange={(next) => setTime(hourIndex, next, isPM)}
								width={64}
								visibleRows={3}
							/>
							<TimeWheel
								values={PERIODS}
								index={isPM ? 1 : 0}
								onIndexChange={(next) => setTime(hourIndex, minuteIndex, next === 1)}
								width={64}
								visibleRows={3}
							/>
						</View>

						<View style={styles.footer}>
							<View style={{ flex: 1 }}>
								<SecondaryButton
									style={[styles.footerButton, styles.footerSecondary]}
									onPress={onClose}
								>
									Cancel
								</SecondaryButton>
							</View>
							<View style={{ flex: 1 }}>
								<PrimaryButton
									style={styles.footerButton}
									onPress={() => {
										onChange(draft);
										onClose();
									}}
								>
									Done
								</PrimaryButton>
							</View>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	backdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	card: {
		width: 320,
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 20,
		gap: 12,
	},
	header: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
	},
	monthRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	chevron: {
		width: 32,
		height: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	dayCell: {
		width: "14.2857%",
		height: 34,
		alignItems: "center",
		justifyContent: "center",
	},
	dayDot: {
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: "center",
		justifyContent: "center",
	},
	dayDottoday: {
		borderWidth: 1,
		borderColor: colors.primary,
	},
	dayDotSelected: {
		backgroundColor: colors.primary,
	},
	divider: {
		height: 1,
		backgroundColor: colors.line_break,
	},
	wheels: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 4,
	},
	footer: {
		flexDirection: "row",
		gap: 8,
	},
	footerButton: {
		width: "100%",
		paddingVertical: 12,
	},
	footerSecondary: {
		borderWidth: 1,
		borderColor: colors.line_break,
	},
});
