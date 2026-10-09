import { notSignedIn } from "../errors";
import { DiscoverType, fetchDiscoverFeed } from "@/api/fetchDiscoverFeed";

import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

/**
 * Placeholder Discover preferences.
 *
 * `discover.tsx` still hardcodes these rather than reading the user's saved tags.
 * They live here so the screen and the app-start warm-up cannot drift apart and
 * start populating two different cache entries.
 */
export const DISCOVER_DEFAULT_MANDATORY = ["high-protein"];
export const DISCOVER_DEFAULT_OPTIONAL = ["high-protein"];

export const useDiscoverFeed = (
	mandatory_tags: string[],
	optional_tags: string[],
	/** Set false by a caller that is not ready yet; the feed still needs a tag. */
	enabled = true,
) => {
	const { getToken } = useAuth();

	return useQuery<DiscoverType, Error>({
		queryKey: ["discover", mandatory_tags, optional_tags],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchDiscoverFeed(mandatory_tags, optional_tags, token);
		},
		// Fetch when the user has expressed *any* preference. Gating on optional
		// tags alone meant a user who set only dietary (mandatory) filters never
		// requested a feed, so the screen stayed empty no matter what.
		enabled:
			enabled && (mandatory_tags.length > 0 || optional_tags.length > 0),
		staleTime: 1000 * 60 * 30, // 30 minutes — feed is rebuilt nightly anyway
		retry: false,
	});
};
/*
export const useFollowedCreators = () => {
	const { getToken } = useAuth();

	return useQuery({
		queryKey: ["following"],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return fetchFollowedCreators(token);
		},
		staleTime: 1000 * 60 * 5,
	});
};

export const useFollowerCount = (creator_id: number) => {
	return useQuery({
		queryKey: ["followers", creator_id],
		queryFn: () => fetchFollowerCount(creator_id),
		staleTime: 1000 * 60 * 5,
	});
};

export const useFollowCreator = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (creator_id: number) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return postFollow(creator_id, token);
		},
		onSuccess: (_, creator_id) => {
			queryClient.invalidateQueries({ queryKey: ["following"] });
			queryClient.invalidateQueries({
				queryKey: ["followers", creator_id],
			});
			queryClient.invalidateQueries({ queryKey: ["discover"] });
		},
	});
};

export const useUnfollowCreator = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (creator_id: number) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return deleteFollow(creator_id, token);
		},
		onSuccess: (_, creator_id) => {
			queryClient.invalidateQueries({ queryKey: ["following"] });
			queryClient.invalidateQueries({
				queryKey: ["followers", creator_id],
			});
			queryClient.invalidateQueries({ queryKey: ["discover"] });
		},
	});
};
*/
