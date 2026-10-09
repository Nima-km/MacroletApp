import {
	clearTagPreferences,
	getTagPreferences,
	removeTagPreference,
	setTagPreference,
	TagRole,
} from "@/db/queries/discover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const TAG_PREFERENCES_KEY = ["tag-preferences"];

/**
 * The user's Discovery tags, split into the two roles the feed understands:
 * `required` is the API's `mandatory` (a hard AND filter) and `preferred` is
 * `optional` (which decides the feed's sections).
 *
 * Both come back as slugs, ready to send as query params.
 */
export const useTagPreferences = () => {
	const { data, isLoading } = useQuery({
		queryKey: TAG_PREFERENCES_KEY,
		queryFn: getTagPreferences,
		staleTime: 1000 * 60 * 5,
	});

	const rows = data ?? [];

	return {
		isLoading,
		required: rows
			.filter((row) => row.role === "required")
			.map((row) => row.tag_name),
		preferred: rows
			.filter((row) => row.role === "preferred")
			.map((row) => row.tag_name),
	};
};

/**
 * The feed is cached per tag set, so changing preferences has to invalidate it -
 * otherwise Discover keeps showing sections chosen by the previous filters.
 */
const useInvalidatePreferences = () => {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: TAG_PREFERENCES_KEY });
		queryClient.invalidateQueries({ queryKey: ["discover"] });
	};
};

/** Add a tag, or move it between required and preferred. */
export const useSetTagRole = () => {
	const invalidate = useInvalidatePreferences();
	return useMutation({
		mutationFn: ({ tag_name, role }: { tag_name: string; role: TagRole }) =>
			setTagPreference(tag_name, role),
		onSuccess: invalidate,
	});
};

export const useRemoveTagPreference = () => {
	const invalidate = useInvalidatePreferences();
	return useMutation({
		mutationFn: (tag_name: string) => removeTagPreference(tag_name),
		onSuccess: invalidate,
	});
};

export const useClearTagPreferences = () => {
	const invalidate = useInvalidatePreferences();
	return useMutation({
		mutationFn: clearTagPreferences,
		onSuccess: invalidate,
	});
};
