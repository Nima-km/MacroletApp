import { useFilteredRecipes } from "@/api/hooks/useSearchRecipe";
import SettingsIcon from "@/assets/svg/settings.svg";
import RecipeCard from "@/components/chartComponents/Cards/RecipeCard";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import SearchFilterBottomSheet from "@/components/UIComponents/BottomSheet/SearchFilterBottomSheet";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputSearch } from "@/components/UIComponents/TextInputs/FormInput";
import { H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
const discover = () => {
	const router = useRouter();

	const [searchInput, setSearchInput] = useState("");
	const [committedSearch, setCommittedSearch] = useState("");
	const [filters, setFilters] = useState<Record<string, string>>({});

	const { data, isLoading, isFetching, error, refetch } = useFilteredRecipes(
		filters,
		committedSearch,
	);

	function handleSubmitSearch() {
		setCommittedSearch(searchInput.trim());
		refetch();
	}

	function handleClearSearch() {
		setSearchInput("");
		setCommittedSearch("");
	}
	const sheetRef = useRef<BottomSheet>(null);
	function onOnlineRecipe(recipeSlug: string | undefined | null) {
		console.log("the online selected recipe is", recipeSlug);
		if (recipeSlug)
			router.push({
				pathname: "/(tabs)/(logs)/onlineRecipe",
				params: { recipeSlug },
			});
	}
	useEffect(() => {
		if (error) console.log("error", (error as Error).message, data);
	}, [error]);
	return (
		<View style={{ flex: 1 }}>
			<KeyboardAware>
				<HeaderSimple title="Discover" back={false} />

				<View style={{ flex: 1, padding: 20 }}>
					<View
						style={{
							flexDirection: "row",
							gap: 8,
							marginBottom: 20,
						}}
					>
						<View style={{ flex: 1 }}>
							<FormInputSearch
								value={searchInput}
								onSubmitEditing={handleSubmitSearch}
								onChangeText={setSearchInput}
							/>
						</View>
						<Pressable
							style={{
								backgroundColor: colors.primary_bg,
								borderRadius: 8,
								justifyContent: "center",
								alignItems: "center",
								width: 50,
								height: 50,
							}}
							onPress={() => sheetRef.current?.snapToIndex(2)}
						>
							<SettingsIcon />
						</Pressable>
					</View>
					<View>
						<H5>
							{error?.message} {isFetching ? "loading" : ""}
						</H5>
						<FlatList
							data={data}
							renderItem={({ item }) => (
								<Pressable
									onPress={() =>
										onOnlineRecipe(
											item.recipeData.recipe_slug,
										)
									}
								>
									<RecipeCard recipe={item} />
								</Pressable>
							)}
							scrollEnabled={false}
						/>
					</View>
				</View>
			</KeyboardAware>
			<SearchFilterBottomSheet
				ref={sheetRef}
				onApply={(newFilters) => setFilters(newFilters)}
			/>
		</View>
	);
};

export default discover;

const styles = StyleSheet.create({});
