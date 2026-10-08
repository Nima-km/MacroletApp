import {
	DISCOVER_DEFAULT_MANDATORY,
	DISCOVER_DEFAULT_OPTIONAL,
	useDiscoverFeed,
} from "@/api/hooks/useDiscoverFeed";
import MyTabBar from "@/components/navComponents/MyTabBar";
import { prefetchGetFoodItemRecent } from "@/db/hooks/history/foodItemhistory";
import { prefetchGetAllRecipeList } from "@/db/hooks/recipeBook/getRecipeBookList";
import { colors } from "@/theme";
import { useAuth } from "@clerk/expo";
import { Tabs } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
	const { isSignedIn } = useAuth();

	useEffect(() => {
		prefetchGetFoodItemRecent();
		prefetchGetAllRecipeList();
		// TEMP DIAGNOSTIC (remove with the one in useDiscoverFeed).
		console.log(
			`[startup] tabs layout mounted @${
				typeof performance !== "undefined"
					? Math.round(performance.now())
					: 0
			}ms`,
		);
	}, []);

	// Warms the feed *data*, starting a few ms before the Discover screen's own hook
	// fires (the screen itself is now built at startup via `lazy: false` below,
	// which covers its module graph, first render and image downloads). React Query
	// dedupes on the key, so this is still one request - and gating on `isSignedIn`
	// keeps a signed-out launch from firing a request that can only 401.
	// Same warm-up pattern as the two local prefetches above.
	useDiscoverFeed(
		DISCOVER_DEFAULT_MANDATORY,
		DISCOVER_DEFAULT_OPTIONAL,
		!!isSignedIn,
	);

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
			{/*
				`lazy: false` builds the Discover screen during startup instead of on
				first tap, so its module graph, first render and 12 image downloads
				are already done by the time the user gets there. Deliberately not set
				navigator-wide: that would mount every tab (including test/test1) and
				fire each one's queries at launch.
			*/}
			<Tabs.Screen
				name="(discover)"
				options={{ title: "Discover", lazy: false }}
			/>
			<Tabs.Screen name="(logs)" options={{ title: "Logs" }} />
			<Tabs.Screen name="(profile)" options={{ title: "Profile" }} />
			<Tabs.Screen name="test" options={{ title: "test" }} />
			<Tabs.Screen name="test1" options={{ title: "test1" }} />
		</Tabs>
	);
}
