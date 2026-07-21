import { toastConfig } from "@/components/UIComponents/Toasts/toastConfig";
import { FontProvider } from "@/context/FontProvider";
import { db } from "@/db/client";
import migrations from "@/drizzle/migrations";

import { colors } from "@/theme";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
//import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
//import { openDatabaseSync } from "expo-sqlite";
import React, { Suspense, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	initialWindowMetrics,
	SafeAreaProvider,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

export default function RootLayout() {
	const { success, error } = useMigrations(db, migrations);

	const [loaded, fontError] = useFonts({
		"Metro-Medium": require("@/assets/fonts/Metropolis-Medium.ttf"),
		"Metro-SemiBold": require("@/assets/fonts/Metropolis-SemiBold.ttf"),
		"Metro-Regular": require("@/assets/fonts/Metropolis-Regular.ttf"),
		"Metro-Bold": require("@/assets/fonts/Metropolis-Bold.ttf"),
		"GS-Medium": require("@/assets/fonts/general-sans/GeneralSans-Medium.otf"),
	});

	useEffect(() => {
		if (success) {
			console.log("database loaded");
		} else console.log(error);
	}, [success, error]);
	if (!loaded && !error) {
		return null;
	}
	if (!publishableKey) {
		throw new Error(
			"Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable",
		);
	}
	return (
		<QueryClientProvider client={queryClient}>
			<Suspense fallback={<ActivityIndicator size="large" />}>
				<FontProvider>
					<GestureHandlerRootView>
						<ClerkProvider
							publishableKey={publishableKey}
							tokenCache={tokenCache}
						>
							<SafeAreaProvider
								initialMetrics={initialWindowMetrics}
							>
								<Stack
									screenOptions={{
										headerShown: false,
										contentStyle: {
											backgroundColor: colors.error,
										},
									}}
								/>
								<Toast config={toastConfig} />
							</SafeAreaProvider>
						</ClerkProvider>
					</GestureHandlerRootView>
				</FontProvider>
			</Suspense>
		</QueryClientProvider>
	);
}
