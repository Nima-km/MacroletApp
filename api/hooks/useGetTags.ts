import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchApprovedTags } from "../fetchTags";

export const useTags = (search: string = "") => {
	const query = useQuery({
		queryKey: ["tags"],
		queryFn: fetchApprovedTags,
		staleTime: 1000 * 60 * 30, // 30 minutes — tags don't change often
	});

	const filteredTags = useMemo(() => {
		if (!query.data) return [];
		if (!search.trim()) return query.data;
		return query.data.filter((tag) =>
			tag.toLowerCase().includes(search.toLowerCase().trim()),
		);
	}, [query.data, search]);

	return { ...query, filteredTags };
};
