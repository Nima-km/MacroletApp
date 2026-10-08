import { followCreator, unfollowCreator } from "../follow";
import { notSignedIn } from "../errors";
import { useAuth } from "@clerk/expo";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
		},
	});
};
