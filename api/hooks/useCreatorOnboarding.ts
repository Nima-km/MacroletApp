import {
	fetchCreatorStatus,
	saveCreatorProfile,
	startPayoutSetup,
	type CreatorProfileInput,
	type CreatorStatus,
} from "../creator";
import { notSignedIn } from "../errors";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export const CREATOR_STATUS_KEY = ["creator", "status"] as const;

/**
 * Where the user is in the creator flow. One query drives every entry point, so
 * "Become a Creator" / "Finish payouts setup" / "Creator Studio" can never
 * disagree with each other.
 */
export const useCreatorStatus = () => {
	const { getToken, isLoaded, isSignedIn } = useAuth();

	return useQuery({
		queryKey: CREATOR_STATUS_KEY,
		enabled: isLoaded && Boolean(isSignedIn),
		queryFn: async (): Promise<CreatorStatus> => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchCreatorStatus(token);
		},
	});
};

/**
 * Create or update the profile. Publishes immediately - no Stripe step is
 * involved, which is the whole point (docs/PAYOUT_MODEL.md D7).
 */
export const useSaveCreatorProfile = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (profile: CreatorProfileInput) => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return saveCreatorProfile(token, profile);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CREATOR_STATUS_KEY });
		},
	});
};

/**
 * Open Stripe's hosted onboarding.
 *
 * The browser work happens inside `mutationFn` because it *is* the mutation:
 * fetch a link, show it, and report how the user left. `openAuthSessionAsync`
 * (not `openBrowserAsync`) resolves when the browser reaches our return URL, so
 * the sheet closes itself and the status can be refreshed immediately instead of
 * leaving a stale browser tab behind.
 */
export const useStartPayoutSetup = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();
	const returnUrl = Linking.createURL("/creator/onboarding/complete");

	return useMutation({
		mutationFn: async () => {
			const token = await getToken();
			if (!token) throw notSignedIn();

			const { onboarding_url } = await startPayoutSetup(token);

			const browser = await WebBrowser.openAuthSessionAsync(
				onboarding_url,
				returnUrl,
			);

			// Whether they finished or backed out, the answer is on the server.
			await queryClient.invalidateQueries({ queryKey: CREATOR_STATUS_KEY });
			await queryClient.refetchQueries({ queryKey: CREATOR_STATUS_KEY });

			return { onboarding_url, browser };
		},
	});
};
