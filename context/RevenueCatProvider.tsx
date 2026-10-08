import { configureRevenueCat, identifyUser, signOutUser } from "@/lib/revenuecat";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";

/**
 * Keeps the RevenueCat customer in step with the signed-in Clerk user.
 *
 * Must be mounted inside <ClerkProvider>. Renders nothing. Failures are logged,
 * never thrown: entitlement is enforced server-side (requireSubscription), so a
 * RevenueCat problem must not stop the app from running.
 */
export default function RevenueCatProvider() {
	const { isLoaded, userId } = useAuth();

	useEffect(() => {
		configureRevenueCat();
	}, []);

	useEffect(() => {
		if (!isLoaded) return;

		let active = true;
		(async () => {
			try {
				if (userId) await identifyUser(userId);
				else await signOutUser();
			} catch (error) {
				if (active) {
					console.warn("[revenuecat] identity sync failed:", error);
				}
			}
		})();

		return () => {
			active = false;
		};
	}, [isLoaded, userId]);

	return null;
}
