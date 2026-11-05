import { getProfile, saveProfile, StoredProfile } from "@/db/queries/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["profile"];

/**
 * The body profile.
 *
 * A query rather than a store so that every consumer — including the maintenance
 * estimator, which runs off-screen — gets the data on mount. A store would have needed
 * every one of them to remember to hydrate it first, and forgetting is silent.
 */
export const useGetProfile = () =>
	useQuery({ queryKey: KEY, queryFn: getProfile, staleTime: 60_000 });

export const useSaveProfile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (changes: StoredProfile) => saveProfile(changes),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
};
