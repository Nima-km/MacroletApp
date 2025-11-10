import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home' }}/>
            <Stack.Screen name="logFood" options={{ title: 'LogFood' }}/>
            <Stack.Screen name="food" options={{ title: 'Food' }}/>
        </Stack>
    )
}
