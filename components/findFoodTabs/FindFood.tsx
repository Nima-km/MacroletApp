import { useSearchFood } from "@/api/hooks/useSearchFood";
import BarcodeComponent from "@/components/findFoodTabs/BarcodeComponent";
import QuickAddComponent from "@/components/findFoodTabs/QuickAddComponent";
import RecentComponent from "@/components/findFoodTabs/RecentComponent";
import RecipeComponent from "@/components/findFoodTabs/RecipeComponent";
import { useGetFoodItemRecent } from "@/db/hooks/history/foodItemhistory";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import { FoodFullData, FoodItemData } from "@/types/food";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Modal, StyleSheet, View } from "react-native";
import PagerView, {
	PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import HeaderSimple from "../navComponents/HeaderSimple";
import NavSelector from "../navComponents/NavSelector";
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
	const selectedPage = useFindFoodSelectedPageStore((s) => s.selectedPage);
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const [search, setSearch] = useState("");
	const [visitedPages, setVisitedPages] = useState<Set<number>>(
		new Set([selectedPage]),
	);

	useEffect(() => {
		setVisitedPages((prev) => new Set(prev).add(selectedPage));
		//console.warn("visted", visitedPages, selectedPage);
	}, [selectedPage]);
	const [committedQuery, setCommittedQuery] = useState("");
	const { data, isLoading, error, refetch } = useSearchFood(committedQuery);
	const {
		data: recentPages,
		isLoading: loadingSectionList,
		error: errorSectionList,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useGetFoodItemRecent(isNotRecipe, search);
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
			addIngredient({ food: item.food, ingredientItem: item.foodItem });
		},
		[isNotRecipe, addFood, addIngredient],
	);
	const handleSearch = useCallback(() => {
		setCommittedQuery(search.trim());
		refetch();
	}, [search, refetch]);

	const filteredData = useMemo(() => {
		// Once an online search has been committed and returned data, prioritize it
		if (committedQuery && data) {
			return data.map((item) => ({
				food: { ...item },
				foodItem: null,
			}));
		}

		// Otherwise the recent list: filtering and the row limit happen in SQL.
		return recentPages?.pages.flat();
	}, [search, recentPages, data, committedQuery]);

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
						placeholder="Search foods"
						onSubmitEditing={handleSearch}
						onChangeText={setSearch}
					/>
				</View>
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
									filteredData={filteredData}
									onFoodCardID={onFoodCardID}
									onAddFood={onAddFood}
									onEndReached={loadMore}
									isFetchingNextPage={isFetchingNextPage}
								/>
							</View>

							<View key="1" style={{ flex: 1 }}>
								{visitedPages.has(1) && <RecipeComponent />}
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
									filteredData={filteredData}
									onFoodCardID={onFoodCardID}
									onAddFood={onAddFood}
									onEndReached={loadMore}
									isFetchingNextPage={isFetchingNextPage}
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
