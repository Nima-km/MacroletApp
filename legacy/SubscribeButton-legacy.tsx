import {
	getCustomerInfo,
	getPackage,
	hasActiveEntitlement,
	isUserCancelled,
	managementUrl,
	purchase,
	purchaseErrorMessage,
	type SubscriptionPeriod,
} from "@/lib/revenuecat";
import { useEffect, useState } from "react";
import { Linking, Pressable, Text } from "react-native";
import Toast from "react-native-toast-message";

/**
 * Checkout via RevenueCat. The same control becomes "Manage subscription" once
 * the entitlement is active, so there is one obvious action either way.
 *
 * Visual style is unchanged from the Clerk Billing version it replaces - the
 * styled pass for this screen is a separate piece of work (docs/STYLE_GUIDE.md).
 */
export default function SubscribeButton({
	period = "monthly",
}: {
	period?: SubscriptionPeriod;
}) {
	const [busy, setBusy] = useState(false);
	const [entitled, setEntitled] = useState(false);
	const [manageUrl, setManageUrl] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		getCustomerInfo()
			.then((info) => {
				if (!active) return;
				setEntitled(hasActiveEntitlement(info));
				setManageUrl(managementUrl(info));
			})
			.catch(() => {
				// Not configured, or offline: fall through to the subscribe path.
			});

		return () => {
			active = false;
		};
	}, []);

	const handleManage = async () => {
		if (!manageUrl) {
			Toast.show({
				type: "warning",
				text1: "No management page",
				text2: "This account has no subscription to manage.",
			});
			return;
		}
		await Linking.openURL(manageUrl);
	};

	const handleSubscribe = async () => {
		if (busy) return;
		setBusy(true);

		try {
			const pkg = await getPackage(period);
			if (!pkg) {
				Toast.show({
					type: "warning",
					text1: "Plan unavailable",
					text2: "This plan isn't available right now. Please try again later.",
				});
				return;
			}

			const info = await purchase(pkg);
			setEntitled(hasActiveEntitlement(info));
			setManageUrl(managementUrl(info));

			Toast.show({
				type: "success",
				text1: "You're subscribed",
				text2: "Premium is now active on this account.",
			});
		} catch (error) {
			if (isUserCancelled(error)) return;
			console.error("[revenuecat] purchase failed:", error);
			Toast.show({
				type: "error",
				text1: "Purchase failed",
				text2: purchaseErrorMessage(error),
			});
		} finally {
			setBusy(false);
		}
	};

	return (
		<Pressable
			onPress={entitled ? handleManage : handleSubscribe}
			disabled={busy}
		>
			<Text>{entitled ? "Manage subscription" : "Subscribe"}</Text>
		</Pressable>
	);
}
