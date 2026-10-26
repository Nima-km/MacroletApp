import { insertFoodList } from "@/db/queries/food";
import { useSearchFood } from "@/api/hooks/useSearchFood";
import BarcodeComponent from "@/components/findFoodTabs/BarcodeComponent";
import QuickAddComponent from "@/components/findFoodTabs/QuickAddComponent";
import RecentComponent, {
	FoodListRow,
} from "@/components/findFoodTabs/RecentComponent";
import RecipeComponent from "@/components/findFoodTabs/RecipeComponent";
import { useGetFoodItemRecent } from "@/db/hooks/history/foodItemhistory";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import {
	FoodFullData,
	FoodItemData,
	RecentFoodFullData,
} from "@/types/food";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import PagerView, {
	PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import HeaderSimple from "../navComponents/HeaderSimple";
import { isCatalogueIngredient } from "@/helper/recipeDraftValidation";
import { useRecipeDraftStore } from "@/store/recipeStore/useRecipeStore";
import Toast from "react-native-toast-message";
import NavSelector from "../navComponents/NavSelector";
import { H5, H6 } from "../UIComponents/Typography";
import { colors } from "@/theme";
import { useFoodSelectionStore } from "@/store/foodSelectionStore";
import FoodSelectionSheets from "./FoodSelectionSheets";
import { FormInputSearch } from "../UIComponents/TextInputs/FormInput";
interface FindFoodProps {
	onFoodCardID: (
		id: number,
		index?: number,
		ingredientItemData?: FoodItemData,
	) => void;
	onLogFoodList: () => void;
	/** Log a food (true) or collect recipe ingredients (false). */
	isNotRecipe?: boolean;
	isNewRecipe?: boolean;
}

const FindFood = ({
	onFoodCardID,
	onLogFoodList,
	isNotRecipe = true,
	isNewRecipe = false,
}: FindFoodProps) => {
	const addFood = useFoodSelectionStore((s) => s.addFood);
	const addIngredient = useFoodSelectionStore((s) => s.addIngredient);
	const foodCart = useFoodSelectionStore((s) => s.foodList);
	const ingredientCart = useFoodSelectionStore((s) => s.ingredientList);
	const selectedPage = useFindFoodSelectedPageStore((s) => s.selectedPage);
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const [search, setSearch] = useState("");
	// Typing filters what is already on the device; after a short pause the server is
	// asked the same question. Enter used to be the trigger, and the committed term
	// was never cleared - so editing the field left the previous results on screen.
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [visitedPages, setVisitedPages] = useState<Set<number>>(
		new Set([selectedPage]),
	);

	useEffect(() => {
		setVisitedPages((prev) => new Set(prev).add(selectedPage));
		//console.warn("visted", visitedPages, selectedPage);
	}, [selectedPage]);

	useEffect(() => {
		const timeout = setTimeout(
			() => setDebouncedSearch(search.trim()),
			250,
		);
		return () => clearTimeout(timeout);
	}, [search]);
	const {
		data: serverResults,
		isLoading: isSearching,
		error: searchError,
	} = useSearchFood(debouncedSearch);
	const {
		data: recentPages,
		isLoading: loadingSectionList,
		error: errorSectionList,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useGetFoodItemRecent(isNotRecipe, search);

	// Only an ingredient being added to a public recipe has to be a catalogue food, so
	// the filter is offered only there - and starts on, since an unusable ingredient is
	// the thing they are trying to avoid.
	const draftVisibility = useRecipeDraftStore((state) => state.visibility);
	const offersCatalogueFilter =
		!isNotRecipe && draftVisibility === "public";
	const [catalogueOnly, setCatalogueOnly] = useState(true);
	const pagerRef = useRef<PagerView>(null);
	const currentPagerPage = useRef(selectedPage); // tracks the pager's actual current position

	const onPageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
		currentPagerPage.current = e.nativeEvent.position;
		setSelectedPage(e.nativeEvent.position);
	}, []);

	const goToPage = useCallback((index: number) => {
		pagerRef.current?.setPage(index);
	}, []);

	useEffect(() => {
		if (currentPagerPage.current !== selectedPage) {
			currentPagerPage.current = selectedPage;
			goToPage(selectedPage);
		}
		console.log("page changed", selectedPage);
	}, [selectedPage]);
	// Store actions are stable references, so FindFood does not re-render when the
	// selection changes - only FoodSelectionSheets, which displays it, does.
	const onAddFood = useCallback(
		(item: FoodFullData) => {
			if (isNotRecipe) {
				addFood(item);
				return;
			}
			// A recipe is a food with a recipe_id. It can be logged, but it cannot be
			// an ingredient of another recipe.
			if (item.food.recipe_id != null) {
				Toast.show({
					type: "warning",
					text1: "A recipe can't be an ingredient",
					text2: "Pick the individual foods instead.",
				});
				return;
			}
			addIngredient({ food: item.food, ingredientItem: item.foodItem });
		},
		[isNotRecipe, addFood, addIngredient],
	);

	/**
	 * A row was chosen.
	 *
	 * A local row is already saved, so this is just navigation. A server result is not:
	 * searching no longer writes anything, so choosing one upserts exactly that food,
	 * takes the local id, and opens it.
	 */
	const onSelectResult = useCallback(
		async (item: RecentFoodFullData) => {
			if (item.foodItem) {
				onFoodCardID(item.food.id);
				return;
			}
			try {
				const saved = await insertFoodList([item.food]);
				const localId = saved?.[0]?.id;
				if (localId) onFoodCardID(localId);
			} catch (error) {
				console.warn("saving the chosen food failed", error);
			}
		},
		[onFoodCardID],
	);

	// One list, but each row says where it came from: what is already on the
	// device, and what the server returned for the same term.
	// How many times each food sits in the cart, so the list can badge it. Keyed by
	// food id, which is what the rows are keyed on.
	const selectedCounts = useMemo(() => {
		const counts = new Map<number, number>();
		const items = isNotRecipe ? foodCart : ingredientCart;
		items.forEach((item) => {
			const id = item.food?.id;
			if (typeof id === "number") {
				counts.set(id, (counts.get(id) ?? 0) + 1);
			}
		});
		return counts;
	}, [foodCart, ingredientCart, isNotRecipe]);

	const rows = useMemo(() => {
		const keep = (food?: { nickname?: string | null; macros_edited?: boolean | null } | null) =>
			!offersCatalogueFilter || !catalogueOnly || isCatalogueIngredient(food);

		const local = (recentPages?.pages.flat() ?? []).filter((entry) =>
			keep(entry.food),
		);
		const server = (serverResults ?? []).map(
			(item) => ({
				// The API's nutrition fields are optional on the wire; a local food row
				// needs them present, so they are normalised here rather than cast.
				food: {
					...item,
					id: item.id ?? -1,
					protein: item.protein ?? 0,
					fat: item.fat ?? 0,
					carbs: item.carbs ?? 0,
					fiber: item.fiber ?? 0,
					serving_100g: item.serving_100g ?? 0,
					volume_100ml: item.volume_100ml ?? 0,
					barcode: item.barcode ?? "",
					brand: item.brand ?? null,
					nickname: item.nickname ?? null,
					recipe_id: item.recipe_id ?? null,
					micro_nutriants: item.micro_nutriants ?? null,
				},
				foodItem: null,
			}),
		) as RecentFoodFullData[];

		const filteredServer = server.filter((entry) => keep(entry.food));
		const built: FoodListRow[] = [];

		if (local.length > 0) {
			built.push({
				kind: "header",
				id: "h-local",
				title: debouncedSearch ? "Your foods" : "Recent",
			});
			local.forEach((entry, index) =>
				built.push({
					kind: "food",
					id: `local-${entry.food.id}-${index}`,
					item: entry,
				}),
			);
		}

		if (debouncedSearch) {
			if (isSearching) {
				built.push({
					kind: "status",
					id: "s-searching",
					text: "Searching all foods…",
				});
			} else if (searchError) {
				built.push({
					kind: "status",
					id: "s-error",
					text: "Couldn't search all foods. Check your connection.",
				});
			} else if (filteredServer.length > 0) {
				built.push({
					kind: "header",
					id: "h-server",
					title: "All foods",
				});
				filteredServer.forEach((entry, index) =>
					built.push({
						kind: "food",
						id: `server-${entry.food.id}-${index}`,
						item: entry,
					}),
				);
			} else {
				built.push({
					kind: "status",
					id: "s-empty",
					text: `No foods found for “${debouncedSearch}”.`,
				});
			}
		}

		return built;
	}, [
		recentPages,
		serverResults,
		isSearching,
		searchError,
		debouncedSearch,
		offersCatalogueFilter,
		catalogueOnly,
	]);

	// Only a typed search pages; the default recent list is deliberately short.
	const loadMore = useMemo(
		() => (hasNextPage ? () => fetchNextPage() : undefined),
		[hasNextPage, fetchNextPage],
	);

	/*useFocusEffect(
		useCallback(() => {
			console.log("FindFood is now focused/visible");
			if (!isNotRecipe) {
				goToPage(0);
				//setSelectedPage(0);
			}
			return () => {
				console.log("FindFood lost focus — user navigated away");
			};
		}, []),
	);*/
	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple
				title={isNotRecipe ? "Log Food" : "Add Ingredient"}
				back
			/>
			<View style={styles.container}>
				<View style={{ paddingHorizontal: 20 }}>
					<FormInputSearch
						style={{ paddingHorizontal: 20 }}
						value={search}
						placeholder={
							selectedPage === 1
								? "Search your recipes"
								: "Search foods"
						}
						onChangeText={setSearch}
					/>
				</View>
				{offersCatalogueFilter ? (
					<View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
						<Pressable
							onPress={() => setCatalogueOnly((prev) => !prev)}
							style={{
								alignSelf: "flex-start",
								flexDirection: "row",
								alignItems: "center",
								gap: 8,
								paddingHorizontal: 12,
								paddingVertical: 6,
								borderRadius: 8,
								backgroundColor: catalogueOnly
									? colors.primary_bg
									: colors.off_white,
							}}
							accessibilityRole="checkbox"
							accessibilityState={{ checked: catalogueOnly }}
						>
							<H6
								style={{
									color: catalogueOnly
										? colors.primary
										: colors.inactive,
								}}
							>
								{catalogueOnly ? "✓ " : ""}Catalogue ingredients only
							</H6>
						</Pressable>
					</View>
				) : null}
				<View style={{ marginVertical: 12 }}>
					<NavSelector
						selectedValue={selectedPage}
						onSelect={(value) => setSelectedPage(value)}
						isNotRecipe={isNotRecipe}
					/>
				</View>
				<View style={{ flex: 1 }}>
					{isNotRecipe ? (
						<PagerView
							ref={pagerRef}
							style={{ flex: 1 }}
							initialPage={selectedPage}
							onPageSelected={onPageSelected}
						>
							<View key="0" style={{ flex: 1 }}>
								<RecentComponent
									rows={rows}
									title={debouncedSearch ? "Search" : "Recent"}
									onSelect={onSelectResult}
									onAddFood={onAddFood}
									onEndReached={loadMore}
									isFetchingNextPage={isFetchingNextPage}
									selectedCounts={selectedCounts}
								/>
							</View>

							<View key="1" style={{ flex: 1 }}>
								{visitedPages.has(1) && <RecipeComponent search={search} onAddFood={onAddFood} />}
							</View>
							<View key="2" style={{ flex: 1 }}>
								{selectedPage === 2 && (
									<BarcodeComponent onScan={onFoodCardID} />
								)}
							</View>
							<View key="3" style={{ flex: 1 }}>
								{visitedPages.has(3) && <QuickAddComponent />}
							</View>
						</PagerView>
					) : (
						<PagerView
							ref={pagerRef}
							style={{ flex: 1 }}
							initialPage={selectedPage}
							onPageSelected={onPageSelected}
						>
							<View key="0" style={{ flex: 1 }}>
								<RecentComponent
									rows={rows}
									title={debouncedSearch ? "Search" : "Recent"}
									onSelect={onSelectResult}
									onAddFood={onAddFood}
									onEndReached={loadMore}
									isFetchingNextPage={isFetchingNextPage}
									selectedCounts={selectedCounts}
								/>
							</View>

							<View key="1" style={{ flex: 1 }}>
								{selectedPage === 1 && (
									<BarcodeComponent onScan={onFoodCardID} />
								)}
							</View>
						</PagerView>
					)}
				</View>
			</View>
			{/* Only this subtree subscribes to the selection, so a swipe updates the
			    sheet without re-rendering the PagerView or the recent list. */}
			<FoodSelectionSheets
				mode={isNotRecipe ? "food" : "ingredient"}
				onLogFoodList={onLogFoodList}
				onFoodCardID={onFoodCardID}
				isNewRecipe={isNewRecipe}
			/>
		</View>
	);
};

export default FindFood;

const styles = StyleSheet.create({
	container: {
		// marginHorizontal: 20,
		flex: 1,
	},
});
