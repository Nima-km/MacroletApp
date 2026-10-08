import Logo from "@/assets/svg/logo.svg";
import DollarIcon from "@/assets/svg/dollar-frame.svg";
import RecipesIcon from "@/assets/svg/recipe-book.svg";
import SlidersIcon from "@/assets/svg/sliders.svg";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import ProBadge from "@/components/UIComponents/Badges/ProBadge";
import StatusBadge from "@/components/UIComponents/Badges/StatusBadge";
import {
	InlineButton,
	PrimaryButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import {
	H1,
	H3,
	H4,
	H5,
	H5_SemiBold,
	H6,
} from "@/components/UIComponents/Typography";
import {
	EMPTY_SUBSCRIPTION_STATE,
	fallbackManagementUrl,
	formatPrice,
	getPlanOptions,
	getSubscriptionState,
	isUserCancelled,
	monthlyEquivalent,
	purchase,
	purchaseErrorMessage,
	restore,
	savingsPercent,
	type PlanOption,
	type SubscriptionPeriod,
	type SubscriptionState,
} from "@/lib/revenuecat";
import { colors } from "@/theme";
import React, { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

const STORE_NAMES: Record<string, string> = {
	APP_STORE: "the App Store",
	MAC_APP_STORE: "the Mac App Store",
	PLAY_STORE: "Google Play",
	STRIPE: "Stripe",
	AMAZON: "Amazon",
	WEB_BILLING: "the web",
	PROMO: "a promotion",
	TEST_STORE: "the RevenueCat Test Store",
};

const storeName = (store: string | null) =>
	(store && STORE_NAMES[store]) || "your store";

const formatDate = (date: Date) =>
	date.toLocaleDateString(undefined, {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

const BENEFIT_ICON_SIZE = 40;

/** The three promises, in the order the design shows them. */
const BENEFITS = [
	{
		key: "recipes",
		icon: <RecipesIcon width={24} height={24} color={colors.primary} />,
		text: "Discover 1000+ verified recipes from the Macrolet community.",
	},
	{
		key: "coaching",
		icon: <SlidersIcon width={24} height={24} color={colors.primary} />,
		text: "Gain access to our coaching algorithm that automatically adapts to your metabolism.",
	},
	{
		key: "creator",
		icon: <DollarIcon width={24} height={24} color={colors.primary} />,
		text: "Become eligible to join our Creator program and earn from sharing your own recipes.",
	},
];

/**
 * Subscription: the paywall when there is nothing to manage, and a status view
 * when there is.
 *
 * Prices and the "Save X%" badge are read from the store at runtime, never
 * hardcoded, so changing prices in RevenueCat is the only step needed.
 */
const subscription = () => {
	const [state, setState] = useState<SubscriptionState | null>(null);
	const [plans, setPlans] = useState<PlanOption[]>([]);
	const [selected, setSelected] = useState<SubscriptionPeriod>("annual");
	const [busy, setBusy] = useState(false);

	const load = useCallback(async () => {
		try {
			const [nextState, nextPlans] = await Promise.all([
				getSubscriptionState(),
				getPlanOptions(),
			]);
			setState(nextState);
			setPlans(nextPlans);

			// Annual first, matching the design; falls back to whatever exists so a
			// single-cadence offering still works.
			if (nextPlans.some((plan) => plan.period === "annual")) {
				setSelected("annual");
			} else if (nextPlans[0]) {
				setSelected(nextPlans[0].period);
			}
		} catch (error) {
			console.warn("[subscription] could not load:", error);
			setState(EMPTY_SUBSCRIPTION_STATE);
			setPlans([]);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const handleSubscribe = async () => {
		if (busy) return;

		const option = plans.find((plan) => plan.period === selected);
		if (!option) {
			Toast.show({
				type: "warning",
				text1: "Plan unavailable",
				text2: "This plan can't be purchased right now.",
			});
			return;
		}

		setBusy(true);
		try {
			await purchase(option.pkg);
			setState(await getSubscriptionState());
			Toast.show({
				type: "success",
				text1: "Welcome to Premium",
				text2: "Your subscription is now active.",
			});
		} catch (error) {
			if (isUserCancelled(error)) return;
			console.error("[subscription] purchase failed:", error);
			Toast.show({
				type: "error",
				text1: "Purchase failed",
				text2: purchaseErrorMessage(error),
			});
		} finally {
			setBusy(false);
		}
	};

	const handleManage = async () => {
		if (!manageUrl) {
			// Unreachable while the button is gated on `manageUrl`, but a management
			// URL can disappear between render and press.
			Toast.show({
				type: "warning",
				text1: "Nothing to manage here",
				text2: state?.isSandbox
					? "Test Store subscriptions have nothing to cancel."
					: "Change or cancel your subscription in your store account.",
			});
			return;
		}
		try {
			await Linking.openURL(manageUrl);
		} catch (error) {
			console.error("[subscription] could not open management URL:", error);
			Toast.show({
				type: "error",
				text1: "Couldn't open the store",
				text2: "Manage your subscription from your store account.",
			});
		}
	};

	const handleRestore = async () => {
		if (busy) return;
		setBusy(true);
		try {
			await restore();
			const nextState = await getSubscriptionState();
			setState(nextState);

			Toast.show(
				nextState.entitled
					? {
							type: "success",
							text1: "Purchases restored",
							text2: "Your subscription is active on this account.",
						}
					: {
							type: "info",
							text1: "Nothing to restore",
							text2: "No previous subscription was found for this account.",
						},
			);
		} catch (error) {
			if (isUserCancelled(error)) return;
			console.error("[subscription] restore failed:", error);
			Toast.show({
				type: "error",
				text1: "Restore failed",
				text2: "Please try again in a moment.",
			});
		} finally {
			setBusy(false);
		}
	};

	const monthly = plans.find((plan) => plan.period === "monthly") ?? null;
	const selectedPlan = plans.find((plan) => plan.period === selected) ?? null;
	const store = storeName(state?.store ?? null);
	const entitled = state?.entitled === true;
	const unavailable = state !== null && !state.configured;
	// RevenueCat's own URL when the store gives it one, otherwise the store's
	// subscription page. Null for sandbox purchases, which have neither.
	const manageUrl =
		state?.managementUrl ?? fallbackManagementUrl(state?.store ?? null);

	const renderPlan = (plan: PlanOption) => {
		const isSelected = plan.period === selected;
		const saving = savingsPercent(plan, monthly);

		return (
			<Pressable
				key={plan.period}
				onPress={() => setSelected(plan.period)}
				style={[styles.plan, isSelected && styles.planSelected]}
				accessibilityRole="radio"
				accessibilityState={{ selected: isSelected }}
			>
				<View style={styles.planTop}>
					<View style={[styles.radio, isSelected && styles.radioOn]}>
						{isSelected ? <View style={styles.radioDot} /> : null}
					</View>
					<H4 style={styles.planTitle}>{plan.title} Plan</H4>
					<View style={styles.planTopRight}>
						{saving !== null ? (
							<View style={styles.savePill}>
								<H6 style={styles.savePillInk}>
									Save {saving}%
								</H6>
							</View>
						) : (
							<H5_SemiBold>{plan.priceString}/mo</H5_SemiBold>
						)}
					</View>
				</View>

				<View style={styles.planBottom}>
					<H6 style={styles.muted}>
						{plan.period === "annual"
							? `${plan.priceString} billed annually`
							: `${plan.priceString} billed monthly`}
					</H6>
					{plan.period === "annual" ? (
						<H5_SemiBold>
							{formatPrice(monthlyEquivalent(plan), plan.currencyCode)}
							/mo
						</H5_SemiBold>
					) : null}
				</View>
			</Pressable>
		);
	};

	return (
		<KeyboardAware>
			<HeaderSimple />
			<View style={styles.content}>
				<View style={styles.brand}>
					{/* The asset hardcodes its own rust fill, so no colour prop. */}
					<Logo width={48} height={42} />
					<H3 style={styles.wordmark}>MACROLET</H3>
					<ProBadge />
				</View>

				{entitled ? (
					<>
						<H1 style={styles.heading}>You're Premium</H1>
						{state?.billingIssue ? (
							<View style={styles.centred}>
								<StatusBadge label="Payment issue" tone="warning" />
							</View>
						) : null}
						<H5 style={styles.lede}>
							{state?.billingIssue
								? "There's a problem with your payment method. Update it to keep access."
								: state?.expiresAt
									? state.willRenew
										? `Renews on ${formatDate(state.expiresAt)}.`
										: `Access ends on ${formatDate(state.expiresAt)}. Auto-renew is off.`
									: "Your subscription is active."}
						</H5>

						{/* A button that cannot act is worse than no button: this is what
						    the Test Store was showing before, because a sandbox
						    subscription has no management page at all. */}
						{manageUrl ? (
							<PrimaryButton onPress={handleManage}>
								Manage subscription
							</PrimaryButton>
						) : (
							<View style={styles.card}>
								<H5 style={styles.muted}>
									{state?.isSandbox
										? "This is a sandbox subscription from the RevenueCat Test Store, so there is nothing to cancel. Real subscriptions are managed in the App Store or Google Play."
										: `This subscription is managed by ${store}. Open it to change or cancel.`}
								</H5>
							</View>
						)}

						{state?.isSandbox ? (
							<H6 style={styles.finePrint}>
								Sandbox subscription — the Test Store runs an
								accelerated clock, so this lapses within minutes
								and renews itself.
							</H6>
						) : null}
					</>
				) : (
					<>
						<H1 style={styles.heading}>Go Premium</H1>

						<View style={styles.benefits}>
							{BENEFITS.map((benefit) => (
								<View key={benefit.key} style={styles.benefit}>
									<View style={styles.benefitIcon}>
										{benefit.icon}
									</View>
									<H5 style={styles.benefitText}>
										{benefit.text}
									</H5>
								</View>
							))}
						</View>

						{unavailable ? (
							<View style={styles.card}>
								<H5 style={styles.muted}>
									Subscriptions aren't available in this build. A
									native rebuild is needed after adding the
									payments SDK.
								</H5>
							</View>
						) : plans.length > 0 ? (
							<View style={styles.plans}>{plans.map(renderPlan)}</View>
						) : (
							<View style={styles.card}>
								<H5 style={styles.muted}>
									No plans are available right now. Please try
									again later.
								</H5>
							</View>
						)}

						{plans.length > 0 ? (
							<PrimaryButton onPress={handleSubscribe} disabled={busy}>
								{busy ? "Processing…" : "Join Now"}
							</PrimaryButton>
						) : null}
					</>
				)}

				<View style={styles.centred}>
					<InlineButton onPress={handleRestore}>
						Restore purchases
					</InlineButton>
				</View>

				<H6 style={styles.finePrint}>
					{selectedPlan && !entitled
						? `${
								selectedPlan.period === "annual"
									? `${selectedPlan.priceString} per year`
									: `${selectedPlan.priceString} per month`
							}, renewing automatically until cancelled. `
						: ""}
					Cancel any time in {store} — cancelling stops the next renewal
					and you keep access until the period ends.
				</H6>
			</View>
		</KeyboardAware>
	);
};

export default subscription;

const styles = StyleSheet.create({
	content: {
		flex: 1,
		padding: 20,
		paddingBottom: 40,
		gap: 20,
	},
	brand: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	wordmark: {
		color: colors.primary,
		letterSpacing: 1.5,
	},
	heading: {
		textAlign: "center",
	},
	lede: {
		color: colors.medium_gray,
		textAlign: "center",
		lineHeight: 21,
	},
	centred: {
		alignItems: "center",
	},
	benefits: {
		gap: 16,
	},
	benefit: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	benefitIcon: {
		width: BENEFIT_ICON_SIZE,
		height: BENEFIT_ICON_SIZE,
		borderRadius: BENEFIT_ICON_SIZE / 2,
		backgroundColor: colors.primary_bg,
		justifyContent: "center",
		alignItems: "center",
	},
	benefitText: {
		flex: 1,
		color: colors.medium_gray,
		lineHeight: 21,
	},
	plans: {
		gap: 12,
	},
	// Selectable card: the guide's radio-card recipe (§7.1). The border is drawn
	// with borderWidth rather than outlineWidth so Android renders it too.
	plan: {
		backgroundColor: colors.white,
		borderRadius: 12,
		padding: 16,
		gap: 8,
		borderWidth: 2,
		borderColor: "transparent",
	},
	planSelected: {
		borderColor: colors.primary,
		backgroundColor: colors.primary_bg,
	},
	planTop: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	planTopRight: {
		flex: 1,
		alignItems: "flex-end",
	},
	planTitle: {
		flexShrink: 1,
	},
	planBottom: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8,
		paddingLeft: 30,
	},
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.inactive,
		justifyContent: "center",
		alignItems: "center",
	},
	radioOn: {
		borderColor: colors.primary,
	},
	radioDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: colors.primary,
	},
	savePill: {
		backgroundColor: colors.primary,
		borderRadius: 22,
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	savePillInk: {
		color: colors.white,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 8,
	},
	muted: {
		color: colors.medium_gray,
		lineHeight: 20,
	},
	finePrint: {
		color: colors.inactive,
		lineHeight: 20,
	},
});
