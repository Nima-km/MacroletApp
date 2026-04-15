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
            <Stack.Screen name="History" options={{ title: "History" }} />
        </Stack>
    );
}
