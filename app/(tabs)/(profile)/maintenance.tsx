import HeaderSimple from "@/components/navComponents/HeaderSimple";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { H1, H3, H4, H5, H6 } from "@/components/UIComponents/Typography";
import {
	useIntakeDayReview,
	useMaintenanceEstimate,
} from "@/db/hooks/weight/useMaintenance";
import { useSetIntakeDayOverride } from "@/db/hooks/intakeDay/useIntakeDayOverrides";
import { ClassifiedDay, dayKey } from "@/helper/intakeDays";
import { toDisplay, unitHeading } from "@/helper/units";
import { useSubscriptionState } from "@/api/hooks/useSubscriptionState";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

/** What each tier means in words, so the number is never bare. */
const TIER_COPY: Record<string, string> = {
	high: "High confidence — based on steady weighing and logging.",
	medium: "Medium confidence — good data, but not yet a month of consistency.",
	low: "Low confidence — treat this as a rough figure and keep logging.",
	prior: "Estimated from your profile, not from measurements. Weigh in and log food for a couple of weeks and this becomes personal to you.",
	none: "Not enough data yet. A couple of weeks of weigh-ins and food logs is all it takes.",
};

export default function Maintenance() {
	const unit = useUnitStore((state) => state.unit);
	const { data: subscription, isLoading: subscriptionLoading } = useSubscriptionState();
	// Maintenance is a Pro feature: it is the algorithm, not the logging.
	const locked = !subscriptionLoading && subscription?.entitled !== true;
	const { estimate, isLoading } = useMaintenanceEstimate();
	const { days } = useIntakeDayReview();
	const { mutate: setDayOverride } = useSetIntakeDayOverride();

	/**
	 * One tap moves a day through its three sensible states: counted, dropped, and back to
	 * whatever the app decides. A day with nothing logged has nothing to decide.
	 */
	function cycleDay(day: ClassifiedDay) {
		const key = dayKey(day.day);
		if (day.items === 0) return;
		if (day.state === "used") {
			setDayOverride({ day: key, state: "exclude" });
		} else if (
			day.state === "excluded-underlogged" ||
			day.state === "excluded-manual"
		) {
			setDayOverride({ day: key, state: "include" });
		} else {
			// Already forced in: the next tap hands the decision back to the app.
			setDayOverride({ day: key, state: null });
		}
	}

	const estimateValue = estimate?.maintenance ?? null;
	const tier = estimate?.tier ?? "none";
	const drivers = estimate?.drivers;

	const rate =
		drivers?.slopeKgPerWeek === null || drivers?.slopeKgPerWeek === undefined
			? null
			: toDisplay(drivers.slopeKgPerWeek * 1000, unit);

	return (
		<KeyboardAware>
			<HeaderSimple title="Maintenance" />
			<View style={styles.page}>
				{locked ? (
					<View style={styles.hero}>
						<H4>Maintenance is a Pro feature</H4>
						<H6 style={styles.muted}>
							It is worked out from your weigh-ins and food logs — what you ate
							against how your weight moved — and re-derived as you go. Logging,
							the trend line and your goals stay free; the estimate itself, its
							confidence and the adaptive calorie goal are Pro.
						</H6>
					</View>
				) : (
					<>
				<View style={styles.hero}>
					<H6 style={styles.muted}>Maintenance</H6>
					{isLoading ? (
						<H5 style={styles.muted}>Working it out…</H5>
					) : estimateValue === null ? (
						<H5 style={styles.muted}>Not enough data yet</H5>
					) : (
						<View style={styles.valueRow}>
							<H1>{estimateValue.toLocaleString()}</H1>
							<H5 style={styles.muted}>
								± {estimate?.range ?? 0} kcal
							</H5>
						</View>
					)}
					<H6 style={styles.muted}>{TIER_COPY[tier]}</H6>
				</View>

				{drivers ? (
					<View style={styles.card}>
						<H4>What went into it</H4>
						<Row
							label="Average intake"
							value={
								drivers.meanIntake === null
									? "—"
									: drivers.loggedDays < 7
										? `${drivers.meanIntake.toLocaleString()} kcal (too few days)`
										: `${drivers.meanIntake.toLocaleString()} kcal`
							}
						/>
						<Row
							label="Weight change"
							value={
								rate === null
									? "—"
									: `${rate > 0 ? "+" : ""}${rate.toFixed(2)} ${unitHeading(unit)}/week`
							}
						/>
						<Row label="Days logged (last 28)" value={`${drivers.loggedDays} of 28`} />
						<Row label="Weigh-ins (last 28)" value={`${drivers.weighIns}`} />
						{drivers.prior !== null && drivers.priorShare > 0 ? (
							<Row
								label="From your profile"
								value={`${Math.round(drivers.priorShare * 100)}%`}
							/>
						) : null}
					</View>
				) : null}

				{estimate && estimate.notes.length > 0 ? (
					<View style={styles.card}>
						<H4>Worth knowing</H4>
						{estimate.notes.map((note) => (
							<H6 key={note} style={styles.muted}>
								{note}
							</H6>
						))}
					</View>
				) : null}

				<View style={styles.card}>
					<H4>Days used</H4>
					<H6 style={styles.muted}>
						Tap a day to count it or drop it. Days that look half-logged are
						dropped automatically; anything you decide stays decided.
					</H6>
					{days
						.filter((day) => day.day.getTime() <= Date.now())
						.slice(-14)
						.reverse()
						.map((day) => {
							const counted = day.counted;
							const label =
								day.state === "used"
									? "counted"
									: day.state === "included-manual"
										? "counted (you)"
										: day.state === "excluded-manual"
											? "dropped (you)"
											: day.state === "excluded-underlogged"
												? "looks half-logged"
												: "not logged";
							return (
								<Pressable
									key={dayKey(day.day)}
									onPress={() => cycleDay(day)}
									disabled={day.items === 0}
									accessibilityRole="button"
									accessibilityLabel={`${dayKey(day.day)}, ${label}`}
									style={styles.dayRow}
								>
									<H5
										style={{
											color: counted ? colors.black : colors.inactive,
										}}
									>
										{day.day.toLocaleDateString(undefined, {
											weekday: "short",
											day: "numeric",
											month: "short",
										})}
									</H5>
									<H6
										style={{
											color: counted ? colors.inactive : colors.primary,
										}}
									>
										{day.items === 0
											? label
											: `${Math.round(day.calories)} kcal · ${label}`}
									</H6>
								</Pressable>
							);
						})}
				</View>

					</>
				)}

				<View style={styles.card}>
					<H6 style={styles.muted}>
						Maintenance is the energy you burn in a day. It is worked out from what
						you ate and how your weight moved, never from a formula alone — which is
						why it takes a fortnight of both before it means anything. It also moves:
						as you lose weight, your maintenance falls with it, so the figure is
						re-derived rather than fixed.
					</H6>
				</View>
			</View>
		</KeyboardAware>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<View style={styles.row}>
			<H5 style={styles.muted}>{label}</H5>
			<H5>{value}</H5>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		paddingHorizontal: 20,
		paddingBottom: 40,
		gap: 20,
	},
	hero: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 20,
		gap: 8,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 10,
	},
	valueRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 8,
	},
	dayRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 6,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	muted: {
		color: colors.inactive,
	},
	title: {
		marginTop: 4,
	},
});
