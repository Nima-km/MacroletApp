import {
	blockUser,
	fetchBlockedAccounts,
	unblockUser,
} from "@/api/blocks";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

/** The block list, for the settings screen. */
export const useBlockedAccounts = () => {
	const { getToken } = useAuth();
	return useQuery({
		queryKey: ["blocks"],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Sign in to see your blocked accounts.");
			return fetchBlockedAccounts(token);
		},
	});
};

function useBlockMutation(kind: "block" | "unblock") {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (username: string) => {
			const token = await getToken();
			if (!token) throw new Error("Sign in first.");
			if (kind === "block") await blockUser(token, username);
			else await unblockUser(token, username);
		},
		onSuccess: async () => {
			// Blocked creators vanish from search and discovery too, so those caches are
			// stale as well as the list itself.
			await queryClient.invalidateQueries();
			Toast.show({
				type: "success",
				text1: kind === "block" ? "Blocked" : "Unblocked",
			});
		},
		onError: (error) =>
			Toast.show({
				type: "error",
				text1:
					kind === "block"
						? "Couldn't block that account"
						: "Couldn't unblock that account",
				text2: error instanceof Error ? error.message : undefined,
			}),
	});
}

export const useBlockAccount = () => useBlockMutation("block");
export const useUnblockAccount = () => useBlockMutation("unblock");
