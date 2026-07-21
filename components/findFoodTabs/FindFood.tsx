import { useSearchFood } from "@/api/hooks/useSearchFood";
import BarcodeComponent from "@/components/findFoodTabs/BarcodeComponent";
import QuickAddComponent from "@/components/findFoodTabs/QuickAddComponent";
import RecentComponent from "@/components/findFoodTabs/RecentComponent";
import RecipeComponent from "@/components/findFoodTabs/RecipeComponent";
import { useGetFoodItemRecent } from "@/db/hooks/history/foodItemhistory";
import { servingSizeProvider } from "@/helper/ServingSizeProvider";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import { FoodFullData, FoodItemData } from "@/types/food";
import { IngredientFullData } from "@/types/recipe";
import BottomSheet from "@gorhom/bottom-sheet";
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
import FoodBottomSheet from "../UIComponents/BottomSheet/FoodBottomSheet";
import IngredientBottomSheet from "../UIComponents/BottomSheet/IngredientBottomSheet";
import QuickAddIngredientModal from "../UIComponents/Modals/QuickAddIngredientModal";
import { FormInputSearch } from "../UIComponents/TextInputs/FormInput";
interface FindFoodProps {
	onFoodCardID: (
		id: number,
		index?: number,
		ingredientItemData?: FoodItemData,
	) => void;
	onLogFoodList: () => void;
	setFoodList?: React.Dispatch<React.SetStateAction<FoodFullData[]>>;
	setIngredientList?: React.Dispatch<
		React.SetStateAction<IngredientFullData[]>
	>;
	foodList?: FoodFullData[];
	ingredientList?: IngredientFullData[];
	isNewRecipe?: boolean;
}

const FindFood = ({
	onFoodCardID,
	onLogFoodList,
	setFoodList,
	setIngredientList,
	foodList,
	ingredientList,
	isNewRecipe = false,
}: FindFoodProps) => {
	const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
	const [quickSelectedIndex, setQuickSelectedIndex] = useState<number>();
	const isNotRecipe =
		ingredientList == undefined && setIngredientList == undefined;
	const selectedPage = useFindFoodSelectedPageStore((s) => s.selectedPage);
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const sheetRef = useRef<BottomSheet>(null);
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
		data: history,
		isLoading: loadingSectionList,
		error: errorSectionList,
	} = useGetFoodItemRecent(isNotRecipe);
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
	const onAddFood = useCallback(
		(item: FoodFullData) => {
			if (setFoodList) setFoodList((prev) => [...prev, item]);
			if (setIngredientList) {
				const processed = {
					food: item.food,
					ingredientItem: item.foodItem,
				};
				setIngredientList((prev) => [...prev, processed]);
			}
		},
		[setFoodList, setIngredientList],
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

		// Otherwise fall back to local filtering of recent/history items
		return history
			?.filter((item) =>
				item.food.name.toLowerCase().includes(search.toLowerCase()),
			)
			.slice(0, 4);
	}, [search, history, data, committedQuery]);

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
			{foodList && setFoodList && (
				<FoodBottomSheet
					onLogAll={onLogFoodList}
					ref={sheetRef}
					foodFullData={foodList}
					onRemove={(i) =>
						setFoodList((prev) =>
							prev.filter((_, index) => index !== i),
						)
					}
					onModify={(index, food_id, ingredientItemData) => (
						setQuickSelectedIndex(index),
						setIngredientModalVisible(true),
						console.log("hi")
					)}
				/>
			)}
			{ingredientList && setIngredientList && (
				<IngredientBottomSheet
					onLogAll={onLogFoodList}
					ref={sheetRef}
					ingredientFullData={ingredientList}
					isNewRecipe={isNewRecipe}
					onRemove={(i) =>
						setIngredientList((prev) =>
							prev.filter((_, index) => index !== i),
						)
					}
					onModify={(index, food_id, ingredientItemData) =>
						onFoodCardID(food_id, index, ingredientItemData)
					}
				/>
			)}
			{foodList &&
				setFoodList &&
				quickSelectedIndex != undefined &&
				foodList[quickSelectedIndex] && (
					<Modal
						visible={ingredientModalVisible}
						transparent
						animationType="fade"
						onRequestClose={() => {
							setIngredientModalVisible(false);
						}}
					>
						<QuickAddIngredientModal
							foodData={foodList[quickSelectedIndex].food}
							foodItemData={foodList[quickSelectedIndex].foodItem}
							options={servingSizeProvider({
								servingData: [],
								serving_100g:
									foodList[quickSelectedIndex].food
										.serving_100g,
							})}
							setFoodItem={(item) =>
								setFoodList((prev) => [...prev, item])
							}
							cleanUp={() =>
								quickSelectedIndex !== undefined
									? setFoodList((prev) =>
											prev.filter(
												(_, index) =>
													index !==
													quickSelectedIndex,
											),
										)
									: console.log("didnt run")
							}
							onClose={() => setIngredientModalVisible(false)}
						/>
					</Modal>
				)}
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
