import { toApiError } from "../errors";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useCreatorOnboarding = () => {
	const { getToken } = useAuth();

	return useMutation({
		mutationFn: async ({
			username,
			display_name,
			about,
		}: {
			username?: string;
			display_name?: string;
			about?: string;
		}) => {
			console.log("display name is", display_name);
			const token = await getToken();
			const res = await fetch(`${API_URL}/creator/onboard`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ username, display_name, about }),
			});

			if (!res.ok) throw await toApiError(res);

			return res.json(); // { creator, onboarding_url }
		},
		onSuccess: async (data) => {
			// Open Stripe onboarding in browser
			console.log("ON BROWSER");
			await WebBrowser.openBrowserAsync(data.onboarding_url);
		},
	});
};

export const useOnboardingStatus = () => {
	const { getToken } = useAuth();

	return useQuery({
		queryKey: ["creator", "onboarding", "status"],
		queryFn: async () => {
			const token = await getToken();
			const res = await fetch(`${API_URL}/creator/onboard/status`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw await toApiError(res);
			return res.json(); // { is_complete: boolean }
		},
	});
};
