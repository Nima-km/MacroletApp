import { useAuth } from "@clerk/expo";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const useCreatorOnboarding = () => {
	const { getToken } = useAuth();

	return useMutation({
		mutationFn: async (username: string) => {
			const token = await getToken();
			const res = await fetch(`${API_URL}/creator/onboard`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ username }),
			});

			if (!res.ok) {
				const error = await res.json();
				console.log("got error", error.error);
				throw new Error(error.error);
			}

			return res.json(); // { creator, onboarding_url }
		},
		onSuccess: async (data) => {
			// Open Stripe onboarding in browser
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
			if (!res.ok) throw new Error("Failed to check onboarding status");
			return res.json(); // { is_complete: boolean }
		},
	});
};
