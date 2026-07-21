import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";
import { postCredit } from "../postCredit";

export const usePostCredit = () => {
	const { getToken } = useAuth();

	const mutation = useMutation({
		mutationFn: async (recipe_slug: string) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return postCredit(recipe_slug, token);
		},
	});

	return mutation;
};
