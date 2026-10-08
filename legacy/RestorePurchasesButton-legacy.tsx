import {
	hasActiveEntitlement,
	isUserCancelled,
	restore,
} from "@/lib/revenuecat";
import { useState } from "react";
import { Pressable, Text } from "react-native";
import Toast from "react-native-toast-message";

/**
 * Restore purchases. Required by App Store review for any app selling
 * subscriptions, and the escape hatch for a user who reinstalls or switches
 * devices.
 */
export default function RestorePurchasesButton() {
	const [busy, setBusy] = useState(false);

	const handleRestore = async () => {
		if (busy) return;
		setBusy(true);

		try {
			const info = await restore();

			if (hasActiveEntitlement(info)) {
				Toast.show({
					type: "success",
					text1: "Purchases restored",
					text2: "Your subscription is active on this account.",
				});
			} else {
				Toast.show({
					type: "info",
					text1: "Nothing to restore",
					text2: "No previous subscription was found for this account.",
				});
			}
		} catch (error) {
			if (isUserCancelled(error)) return;
			console.error("[revenuecat] restore failed:", error);
			Toast.show({
				type: "error",
				text1: "Restore failed",
				text2: "Please try again in a moment.",
			});
		} finally {
			setBusy(false);
		}
	};

	return (
		<Pressable onPress={handleRestore} disabled={busy}>
			<Text>Restore purchases</Text>
		</Pressable>
	);
}
