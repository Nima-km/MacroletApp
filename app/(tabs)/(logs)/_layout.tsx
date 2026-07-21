import { colors } from "@/theme";
import { Stack } from "expo-router";

export default function Layout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: colors.off_white,
				},
				animation: "none",
			}}
		>
			<Stack.Screen name="logs" options={{ title: "logs" }} />
			<Stack.Screen name="logFood" options={{ title: "LogFood" }} />
			<Stack.Screen name="food" options={{ title: "Food" }} />
		</Stack>
	);
}
