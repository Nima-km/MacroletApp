import {
	fetchFollowerCount,
	fetchFollowing,
	followCreator,
	unfollowCreator,
} from "../follow";
import { notSignedIn } from "../errors";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * How many followers a creator has.
 *
 * Public endpoint, no token needed. Disabled without a username, so it stays
 * idle for a signed-in user who has not published a creator profile.
 */
export const useFollowerCount = (username: string | null) =>
	useQuery({
		queryKey: ["followers", username],
		queryFn: () => fetchFollowerCount(username as string),
		enabled: Boolean(username),
		staleTime: 5 * 60 * 1000,
		retry: false,
	});

/**
 * Follow / unfollow by username, driven by the *current* state rather than a
 * separate pair of callbacks, so a caller can never send the wrong verb.
 *
 * Followers and follow state are refetched from the server afterwards instead of
 * being patched locally: the count is shared with other people's follows, so the
 * server's number is the only one worth showing.
 */
export const useToggleFollow = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			username,
			following,
		}: {
			username: string;
			/** Whether the viewer currently follows them. */
			following: boolean;
		}) => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return following
				? unfollowCreator(username, token)
				: followCreator(username, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["creators", "search"] });
			// The public profile carries `is_following`, so following from a
			// Discover card must not leave the profile's button stale.
			queryClient.invalidateQueries({ queryKey: ["creator", "profile"] });
			// Following changes who belongs in "Creators You Follow", and
			// unfollowing has to remove them from it.
			queryClient.invalidateQueries({ queryKey: ["follow", "following"] });
		},
	});
};

/**
 * The creators the signed-in user follows.
 *
 * Drives both the Discover row and the full list behind its arrow. Disabled until
 * signed in, because the endpoint needs the caller's own follow relations - there
 * is no anonymous version of this list.
 */
export const useFollowing = () => {
	const { getToken, isSignedIn } = useAuth();

	return useQuery({
		queryKey: ["follow", "following"],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchFollowing(token);
		},
		enabled: !!isSignedIn,
		staleTime: 60 * 1000,
		retry: false,
	});
};
