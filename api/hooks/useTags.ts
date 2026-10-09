import { fetchApprovedTags, fetchPopularTags } from "../fetchTags";
import { useQuery } from "@tanstack/react-query";

/**
 * The tag vocabulary to offer the user.
 *
 * Comes from the server rather than a hardcoded list: a tag that does not exist
 * (or is not `approved`) has no cached recipes, so offering it produces a
 * selection that silently shows nothing. `GET /tag` already returns only approved
 * names.
 */
export const useApprovedTags = () =>
	useQuery({
		queryKey: ["tags", "approved"],
		queryFn: fetchApprovedTags,
		staleTime: 30 * 60 * 1000,
		retry: false,
	});

/**
 * Tags with their recipe counts, for the preference chips.
 *
 * Preferred over `useApprovedTags` wherever a choice is offered, because the count
 * lets the UI avoid suggesting a tag that would show nothing.
 */
export const usePopularTags = () =>
	useQuery({
		queryKey: ["tags", "popular"],
		queryFn: fetchPopularTags,
		staleTime: 30 * 60 * 1000,
		retry: false,
	});
