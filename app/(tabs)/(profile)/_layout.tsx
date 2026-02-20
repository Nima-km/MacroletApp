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
            }}
        >
            <Stack.Screen name="profile" options={{ title: "profile" }} />
            <Stack.Screen name="goals" options={{ title: "goals" }} />
        </Stack>
    );
}
