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

	// The Discover feed is no longer warmed up from here. The tags come from the
	// local `tagPreference` table, and a read of SQLite is async - so this would have
	// fetched with the placeholder tags and then fetched again with the user's real
	// ones. `lazy: false` on the tabs below already builds those screens during
	// startup, so Discover fires the request itself, once, with the right tags.

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
			{/*
				`lazy: false` builds a tab during startup rather than on first tap, so
				switching to it is instant: its module graph, first render, images and
				queries are already done. Set on all four real tabs.

				The cost is honest and worth stating: app launch now carries that work.
				Home and Logs only read the local database, Discover fetches its feed
				(premium-gated), and Profile asks for creator status - so launch pays
				for one feed request and one status request, plus four screens' first
				render instead of one.

				`test` and `test1` stay lazy on purpose: they are scaffolding, and
				preloading them would add their work to every launch for no benefit.
			*/}
			<Tabs.Screen
				name="(Home)"
				options={{ title: "Home", headerShown: false, lazy: false }}
			/>
			<Tabs.Screen
				name="(discover)"
				options={{ title: "Discover", lazy: false }}
			/>
			<Tabs.Screen name="(logs)" options={{ title: "Logs", lazy: false }} />
			<Tabs.Screen
				name="(profile)"
				options={{ title: "Profile", lazy: false }}
			/>
			<Tabs.Screen name="test" options={{ title: "test" }} />
			<Tabs.Screen name="test1" options={{ title: "test1" }} />
		</Tabs>
	);
}
