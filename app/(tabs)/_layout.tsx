import MyTabBar from "@/components/navComponents/MyTabBar";
import { colors } from "@/theme";
import { Tabs } from "expo-router";

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                sceneStyle: {
                    backgroundColor: colors.off_white,
                },
            }}
            tabBar={(props) => <MyTabBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{ title: "Home", headerShown: false }}
            />
            <Tabs.Screen name="discover" options={{ title: "Discover" }} />
            <Tabs.Screen name="(logs)" options={{ title: "Logs" }} />
            <Tabs.Screen name="(profile)" options={{ title: "Profile" }} />
            <Tabs.Screen name="test" options={{ title: "test" }} />
            <Tabs.Screen name="test1" options={{ title: "test1" }} />
        </Tabs>
    );
}
