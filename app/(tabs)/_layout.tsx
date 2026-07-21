import MyTabBar from "@/components/navComponents/MyTabBar";
import { prefetchGetFoodItemRecent } from "@/db/hooks/history/foodItemhistory";
import { prefetchGetAllRecipeList } from "@/db/hooks/recipeBook/getRecipeBookList";
import { colors } from "@/theme";
import { Tabs } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
	useEffect(() => {
		prefetchGetFoodItemRecent();
		prefetchGetAllRecipeList();
	}, []);
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
				name="(Home)"
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
