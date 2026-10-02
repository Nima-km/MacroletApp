import { notSignedIn } from "../errors";
import { DiscoverType, fetchDiscoverFeed } from "@/api/fetchDiscoverFeed";

import { useAuth } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";

export const useDiscoverFeed = (
	mandatory_tags: string[],
	optional_tags: string[],
) => {
	const { getToken } = useAuth();

	return useQuery<DiscoverType, Error>({
		queryKey: ["discover", mandatory_tags, optional_tags],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchDiscoverFeed(mandatory_tags, optional_tags, token);
		},
		enabled: optional_tags.length > 0, // only fetch if user has optional tags set
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
