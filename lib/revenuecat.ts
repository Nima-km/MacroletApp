import { NativeModules, Platform } from "react-native";
import Purchases, {
	LOG_LEVEL,
	type CustomerInfo,
	type PurchasesPackage,
} from "react-native-purchases";

/**
 * RevenueCat client glue (docs/PAYOUT_MODEL.md §16).
 *
 * The entitlement id here must match the backend's REVENUECAT_ENTITLEMENT_KEY,
 * and the Clerk user id is handed to RevenueCat as the app user id - that is
 * what makes webhook events, the server-side entitlement cache, and this device
 * all agree on who has paid.
 *
 * Only public SDK keys belong in the app. The secret key lives on the server.
 */

export const ENTITLEMENT_ID =
	process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT ?? "macrolet_pro";

/** RevenueCat's standard package identifiers, as configured in the dashboard. */
const MONTHLY_PACKAGE = "$rc_monthly";
const ANNUAL_PACKAGE = "$rc_annual";

export type SubscriptionPeriod = "monthly" | "annual";

/**
 * Platform public key, falling back to the Test Store key so the purchase flow
 * can be exercised before the App Store / Play Store apps exist.
 */
function publicApiKey(): string | undefined {
	const platformKey =
		Platform.OS === "ios"
			? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
			: Platform.OS === "android"
				? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
				: undefined;

	return platformKey ?? process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY;
}

let configured = false;
let warnedUnavailable = false;

/**
 * Mirrors the SDK's own environment check (`shouldUseBrowserMode`).
 *
 * The SDK only tolerates a missing native module in its JS preview mode, which
 * it enables for web, Expo Go and the Rork sandbox. Everywhere else a null
 * `NativeModules.RNPurchases` means the binary was compiled before
 * `react-native-purchases` was installed - and the SDK's methods then
 * dereference null internally, so calling in throws. Rebuilding the dev client
 * is the real fix; this check keeps a stale build from taking the app down.
 */
function nativeModuleAvailable(): boolean {
	if (NativeModules.RNPurchases) return true;
	if (Platform.OS === "web") return true;
	// Expo Go exposes `globalThis.expo.modules.ExpoGo`; a dev build does not.
	const expo = (globalThis as { expo?: { modules?: { ExpoGo?: unknown } } })
		.expo;
	return Boolean(expo?.modules?.ExpoGo);
}

/**
 * Configure once, at app start. Returns false when there is no key or no native
 * module, in which case every other function here degrades to a no-op rather
 * than throwing - the app must still run without RevenueCat.
 */
export function configureRevenueCat(): boolean {
	if (configured) return true;

	if (!nativeModuleAvailable()) {
		if (!warnedUnavailable) {
			warnedUnavailable = true;
			console.warn(
				"[revenuecat] native module (RNPurchases) is missing from this " +
					"build, so purchases are disabled. This normally means the app " +
					"was built before react-native-purchases was installed - " +
					"rebuild the dev client (`npx expo run:android` or " +
					"`eas build --profile development`).",
			);
		}
		return false;
	}

	const apiKey = publicApiKey();
	if (!apiKey) {
		console.warn(
			"[revenuecat] no public SDK key configured, purchases are disabled. " +
				"Set EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY " +
				"(or EXPO_PUBLIC_REVENUECAT_TEST_KEY while on the Test Store).",
		);
		return false;
	}

	try {
		if (__DEV__) {
			// Async in the SDK, and it dereferences the native module without
			// guarding: an unhandled rejection here red-screens a dev build.
			Purchases.setLogLevel(LOG_LEVEL.DEBUG).catch((error) =>
				console.warn("[revenuecat] setLogLevel failed:", error),
			);
		}
		Purchases.configure({ apiKey });
		configured = true;
		return true;
	} catch (error) {
		console.warn("[revenuecat] configure failed:", error);
		return false;
	}
}

export function isConfigured(): boolean {
	return configured;
}

/**
 * Tie the RevenueCat customer to the signed-in Clerk user. RevenueCat carries
 * anonymous purchases over on logIn, so buying before signing in still works.
 */
export async function identifyUser(
	clerkUserId: string,
): Promise<CustomerInfo | null> {
	if (!configureRevenueCat()) return null;
	const { customerInfo } = await Purchases.logIn(clerkUserId);
	return customerInfo;
}

/** Back to an anonymous customer on sign-out. */
export async function signOutUser(): Promise<void> {
	if (!configured) return;
	try {
		await Purchases.logOut();
	} catch {
		// Already anonymous - logging out twice is not worth surfacing.
	}
}

export function hasActiveEntitlement(
	info: CustomerInfo | null | undefined,
): boolean {
	return Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]);
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
	if (!configureRevenueCat()) return null;
	return Purchases.getCustomerInfo();
}

export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
	if (!configureRevenueCat()) return [];
	const offerings = await Purchases.getOfferings();
	return offerings.current?.availablePackages ?? [];
}

/**
 * The package for a billing period.
 *
 * Two rules, both deliberate:
 *  - only packages with a product attached are considered, because RevenueCat
 *    lets a package slot exist without a store product wired to it, and
 *    purchasing one fails with an opaque store error;
 *  - never substitute a different billing period, so a missing monthly product
 *    can't silently charge someone for a year instead.
 */
export async function getPackage(
	period: SubscriptionPeriod,
): Promise<PurchasesPackage | null> {
	const packages = await getAvailablePackages();
	const purchasable = packages.filter((pkg) => Boolean(pkg.product));
	const wanted = period === "annual" ? ANNUAL_PACKAGE : MONTHLY_PACKAGE;

	return purchasable.find((pkg) => pkg.identifier === wanted) ?? null;
}

export async function purchase(
	pkg: PurchasesPackage,
): Promise<CustomerInfo> {
	// `purchase` is the one entry point that skipped the guard: without it a
	// missing native module surfaces as a raw null dereference.
	if (!configureRevenueCat()) {
		throw new Error("Purchases are not available on this build.");
	}
	const { customerInfo } = await Purchases.purchasePackage(pkg);
	return customerInfo;
}

export async function restore(): Promise<CustomerInfo> {
	if (!configureRevenueCat()) {
		throw new Error("Purchases are not configured on this build.");
	}
	return Purchases.restorePurchases();
}

/** The store's own subscription-management page for this customer. */
export function managementUrl(
	info: CustomerInfo | null | undefined,
): string | null {
	return info?.managementURL ?? null;
}

/**
 * A store-level page to manage subscriptions, for when RevenueCat has no
 * per-customer URL.
 *
 * `managementURL` is populated for real App Store and Play Store subscriptions
 * but is **null for a Test Store subscription** (verified against this project's
 * own customer record: `"store": "test_store"`, `"management_url": null`). With
 * no fallback the manage button had nowhere to go, which a subscriber reads as
 * broken.
 */
export function fallbackManagementUrl(store: string | null): string | null {
	switch (store) {
		case "APP_STORE":
		case "MAC_APP_STORE":
			return "https://apps.apple.com/account/subscriptions";
		case "PLAY_STORE":
			return "https://play.google.com/store/account/subscriptions";
		default:
			// Sandbox / promotional / billing-service subscriptions have no store
			// page to send anyone to. Say so instead of offering a dead button.
			return null;
	}
}

/**
 * Everything the subscription screen needs, in one read.
 *
 * `configured: false` covers both "no SDK key" and "native module missing from
 * this build" - the screen says so plainly rather than looking like a user who
 * simply has not subscribed. Without this, tapping Subscribe on a stale build
 * silently does nothing.
 */
export type SubscriptionState = {
	configured: boolean;
	entitled: boolean;
	productIdentifier: string | null;
	periodType: string | null;
	expiresAt: Date | null;
	willRenew: boolean;
	store: string | null;
	/** True for Test Store / sandbox purchases, which run an accelerated clock. */
	isSandbox: boolean;
	billingIssue: boolean;
	managementUrl: string | null;
};

export const EMPTY_SUBSCRIPTION_STATE: SubscriptionState = {
	configured: false,
	entitled: false,
	productIdentifier: null,
	periodType: null,
	expiresAt: null,
	willRenew: false,
	store: null,
	isSandbox: false,
	billingIssue: false,
	managementUrl: null,
};

export async function getSubscriptionState(): Promise<SubscriptionState> {
	if (!configureRevenueCat()) return EMPTY_SUBSCRIPTION_STATE;

	const info = await Purchases.getCustomerInfo();
	const entitlement = info.entitlements.active[ENTITLEMENT_ID];

	if (!entitlement) {
		return {
			...EMPTY_SUBSCRIPTION_STATE,
			configured: true,
			managementUrl: info.managementURL ?? null,
		};
	}

	return {
		configured: true,
		entitled: Boolean(entitlement.isActive),
		productIdentifier: entitlement.productIdentifier ?? null,
		periodType: entitlement.periodType ?? null,
		expiresAt: entitlement.expirationDate
			? new Date(entitlement.expirationDate)
			: null,
		willRenew: Boolean(entitlement.willRenew),
		store: entitlement.store ?? null,
		isSandbox: Boolean(entitlement.isSandbox),
		billingIssue: Boolean(entitlement.billingIssueDetectedAt),
		managementUrl: info.managementURL ?? null,
	};
}

export type PlanOption = {
	period: SubscriptionPeriod;
	title: string;
	priceString: string;
	/** Numeric price and currency, so cadences can be compared arithmetically. */
	price: number;
	currencyCode: string;
	pkg: PurchasesPackage;
};

const PLAN_TITLES: Record<SubscriptionPeriod, string> = {
	monthly: "Monthly",
	annual: "Annual",
};

const PLAN_PERIODS: SubscriptionPeriod[] = ["monthly", "annual"];

/**
 * The plans actually on offer, cheapest cadence first.
 *
 * Only packages with a product attached are returned - the same rule as
 * `getPackage`, and for the same reason. A missing cadence simply does not
 * appear, so the screen never offers something it cannot sell.
 */
export async function getPlanOptions(): Promise<PlanOption[]> {
	const packages = await getAvailablePackages();
	const options: PlanOption[] = [];

	for (const period of PLAN_PERIODS) {
		const wanted = period === "annual" ? ANNUAL_PACKAGE : MONTHLY_PACKAGE;
		const pkg = packages.find(
			(candidate) =>
				candidate.identifier === wanted && Boolean(candidate.product),
		);
		if (!pkg) continue;

		options.push({
			period,
			title: PLAN_TITLES[period],
			priceString: pkg.product.priceString,
			price: pkg.product.price,
			currencyCode: pkg.product.currencyCode,
			pkg,
		});
	}

	return options;
}

/** A price for display, in whatever currency the store reported. */
export function formatPrice(amount: number, currencyCode: string): string {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: currencyCode,
		}).format(amount);
	} catch {
		return `${amount.toFixed(2)} ${currencyCode}`;
	}
}

/**
 * What a plan costs per month, so different cadences can be compared at all.
 * For an annual plan that is the price divided by twelve - the number a
 * subscriber actually weighs.
 */
export function monthlyEquivalent(option: PlanOption): number {
	return option.period === "annual" ? option.price / 12 : option.price;
}

/**
 * Percentage saved against the monthly plan, rounded - or null when there is no
 * saving (or no monthly plan to compare against).
 *
 * **Computed, never hardcoded.** A "Save 67%" badge that does not match the
 * prices is both a trust problem and an app-review risk, and prices change.
 */
export function savingsPercent(
	option: PlanOption,
	monthly: PlanOption | null | undefined,
): number | null {
	if (!monthly || option.period !== "annual") return null;

	const perMonth = monthlyEquivalent(option);
	if (monthly.price <= 0 || perMonth <= 0) return null;

	const percent = Math.round((1 - perMonth / monthly.price) * 100);
	return percent > 0 ? percent : null;
}

/** Dismissing the store sheet is a choice, not a failure worth a toast. */
export function isUserCancelled(error: unknown): boolean {
	return Boolean((error as { userCancelled?: boolean } | null)?.userCancelled);
}

export function purchaseErrorMessage(error: unknown): string {
	const failure = error as { message?: string; code?: string } | null;

	switch (failure?.code) {
		case "NETWORK_ERROR":
			return "Check your connection and try again.";
		case "PURCHASE_NOT_ALLOWED":
			return "Purchases are not allowed on this device.";
		case "PRODUCT_NOT_AVAILABLE_FOR_PURCHASE":
			return "That plan is not available right now.";
		case "PAYMENT_PENDING":
			return "Your payment is pending approval.";
		default:
			return failure?.message ?? "Something went wrong. Please try again.";
	}
}
