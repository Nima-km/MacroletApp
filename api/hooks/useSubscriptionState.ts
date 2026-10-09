import { getSubscriptionState } from "@/lib/revenuecat";
import { useQuery } from "@tanstack/react-query";

export const SUBSCRIPTION_STATE_KEY = ["subscription", "state"] as const;

/**
 * The device's RevenueCat entitlement.
 *
 * A query rather than a mount-once effect because this outlives a purchase:
 * Profile's plan badge and Discover's premium gate both have to catch up when the
 * user subscribes, and both of those screens stay mounted.
 *
 * The **server remains the authority** - `requireSubscription` answers 403 for a
 * lapsed subscription - this only decides what the UI shows *before* it makes a
 * request, so a free user gets a locked screen instead of a failed one.
 */
export const useSubscriptionState = () =>
	useQuery({
		queryKey: SUBSCRIPTION_STATE_KEY,
		queryFn: getSubscriptionState,
		staleTime: 60 * 1000,
		retry: false,
	});
