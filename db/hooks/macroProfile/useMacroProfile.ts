import {
	deleteMacroProfile,
	getMacroProfiles,
	saveMacroProfile,
	setActiveMacroProfile,
} from "@/db/queries/macroProfile";
import { MacroCheckpoint } from "@/helper/macroProfile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

const KEY = ["macro-profiles"];

export const useGetMacroProfiles = () =>
	useQuery({ queryKey: KEY, queryFn: getMacroProfiles, staleTime: 30_000 });

/** The profile in force, for anything that turns calories into macros. */
export const useActiveMacroProfile = () => {
	const { data, ...rest } = useGetMacroProfiles();
	const active = useMemo(() => data?.find((profile) => profile.active) ?? null, [data]);
	return { ...rest, data: active };
};

export const useSaveMacroProfile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: {
			id?: number;
			name: string;
			preset?: string | null;
			checkpoints: MacroCheckpoint[];
		}) => saveMacroProfile(input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
};

export const useSetActiveMacroProfile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => setActiveMacroProfile(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
};

export const useDeleteMacroProfile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => deleteMacroProfile(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
};
