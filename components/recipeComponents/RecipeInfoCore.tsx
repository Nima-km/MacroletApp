import { usePostCredit } from "@/api/hooks/usePostCredit";
import { updloadRecipe } from "@/api/uploadRecipe";
import Bookmark from "@/assets/svg/bookmark.svg";
import Share from "@/assets/svg/share.svg";
import RecipeNav from "@/components/recipeComponents/RecipeNav";
import Directions from "@/components/recipeComponents/View/Directions";
import Ingredients from "@/components/recipeComponents/View/Ingredients";
import Overview from "@/components/recipeComponents/View/Overview";
import {
	PrimaryButton,
	SubButton,
} from "@/components/UIComponents/Buttons/Button";
import { H2, H5 } from "@/components/UIComponents/Typography";
import { useUpdateRecipe } from "@/db/hooks/recipe/useCreateRecipe";
import { useGetRecipeBookList } from "@/db/hooks/recipeBook/getRecipeBookList";
import {
	useInsertRecipeBook,
	useInsertRecipeBookItem,
} from "@/db/hooks/recipeBook/useRecipeBook";
import {
	useRecipeDraftStore,
	useRecipeStateStore,
} from "@/store/recipeStore/useRecipeStore";
import { colors } from "@/theme";
import { RecipeData } from "@/types/recipe";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
	Modal,
	NativeScrollEvent,
	NativeSyntheticEvent,
	ScrollView,
	View,
} from "react-native";
import IconButton from "../UIComponents/Buttons/IconButton";
import CreateRecipeBook from "../UIComponents/Modals/CreateRecipeBook";
import SelectRecipeBook from "../UIComponents/Modals/SelectRecipeBook";
type MODETYPES = "draft" | "state";
interface Props {
	servings: number;
	canModifyIngredient?: boolean;
	mode?: MODETYPES;
	setServings: (newServing: number) => void;
	onLogRecipe?: () => void;
	onUploadRecipe?: () => void;
}

type SectionKey = "ingredients" | "overview" | "directions";
const RecipeInfoCore = ({
	servings,
	canModifyIngredient = true,
	mode = "state",
	setServings,
	onLogRecipe,
	onUploadRecipe,
}: Props) => {
	const { getToken, has } = useAuth();
	const scrollViewRef = useRef<ScrollView>(null);
	const sectionPositions = useRef<Partial<Record<SectionKey, number>>>({});
	const [scrollPositions, setScrollPositions] = useState(0);
	const { mutate: giveCredit } = usePostCredit();
	const recipeFullData =
		mode == "state"
			? useRecipeStateStore((state) => state.data)
			: useRecipeDraftStore((state) => state.data);
	const [showCreateRecipe, setShowCreateRecipe] = useState(false);
	const [showSelectRecipe, setShowSelectRecipe] = useState(false);

	const {
		data: recipeBookList,
		isLoading: recipeBookLoading,
		error: recipeBookError,
	} = useGetRecipeBookList();
	const { mutate: insertRecipeBook } = useInsertRecipeBook();
	const { mutate: updateRecipe } = useUpdateRecipe();
	const { mutate: insertRecipeBookItem } = useInsertRecipeBookItem();

	const foodData =
		mode == "state"
			? useRecipeStateStore((state) => state.data.foodData)
			: useRecipeDraftStore((state) => state.data.foodData);
	const recipeData =
		mode == "state"
			? useRecipeStateStore((state) => state.data.recipeData)
			: useRecipeDraftStore((state) => state.data.recipeData);
	const router = useRouter();
	const [selectedPage, setSelectedPage] = useState(0);
	const [servingString, setServingString] = useState(servings.toString());

	const handleLogRecipe = () => {
		onLogRecipe?.();
		const recipe_slug = recipeData.recipe_slug;
		if (recipe_slug)
			giveCredit(recipe_slug, {
				onError: (error) => {
					console.warn("Credit recording failed:", error);
				},
				onSuccess: () => {
					console.log("credited successfully");
				},
			});
		else console.log("no recipe_slug given in recipeInfoCore");
	};
	const scrollToSection = (key: SectionKey) => {
		const y = sectionPositions.current[key];
		if (y !== undefined) {
			scrollViewRef.current?.scrollTo({ y, animated: false });
		}
	};
	const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const scrollY = event.nativeEvent.contentOffset.y;
		setScrollPositions((prev) => scrollY);
		if (scrollY >= (sectionPositions.current["directions"] ?? 0))
			setSelectedPage(2);
		else if (scrollY >= (sectionPositions.current["ingredients"] ?? 0))
			setSelectedPage(1);
		else setSelectedPage(0);
		console.log("scroll position ub recipeInfoCore", scrollY);
	};

	async function onUpload() {
		const clerk_token = await getToken();
		const recipeDataWithDirections = {
			...recipeFullData,
			recipeData: {
				...recipeFullData.recipeData,
				directions: recipeFullData.recipeData.directions || [],
			},
		};
		updloadRecipe(
			recipeDataWithDirections as RecipeData,
			clerk_token ?? "",
		).catch((e) => console.log(e));
		//.then(updateRecipe(recipe)); FOR MAKING SURE DUPLICATE RECIPES DON'T GET REUPLOADED
	}
	function createRecipeBook(newName: string) {
		insertRecipeBook(
			{ name: newName },
			{ onSuccess: () => console.log("logged") },
		);
	}
	function AddRecipeBookItem(selectedBookID?: number) {
		if (recipeData.id && selectedBookID)
			insertRecipeBookItem(
				{ recipe_id: recipeData.id, recipeBook_id: selectedBookID },
				{ onSuccess: () => console.log("logged") },
			);
		else console.log("something went wrong");
	}
	function onServingChange(newServings: string) {
		setServingString(newServings);
		setServings(Number(newServings));
	}

	return (
		<ScrollView
			style={{ flex: 1, paddingHorizontal: 20 }}
			stickyHeaderIndices={[mode == "state" ? 5 : 4]}
			ref={scrollViewRef}
			onScroll={handleScroll}
		>
			<View
				style={{
					backgroundColor: colors.primary_bg,
					height: 160,
					marginHorizontal: -20,
					marginBottom: 20,
				}}
			></View>

			<H2>{foodData.name}</H2>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					marginBottom: 8,
					marginTop: 10,
					gap: 8,
				}}
			>
				<H5 style={{ color: colors.medium_gray }}>Private recipe</H5>
				<SubButton>Shrimp</SubButton>
				<SubButton>Chinese</SubButton>
			</View>
			<H5 style={{ color: colors.medium_gray, marginBottom: 8 }}>
				{recipeData.description}
			</H5>
			{mode == "state" && (
				<View
					style={{
						flexDirection: "row",
						paddingVertical: 12,
						gap: 8,
					}}
				>
					<PrimaryButton
						style={{ flex: 1 }}
						onPress={handleLogRecipe}
					>
						Log
					</PrimaryButton>
					<IconButton
						onPress={() => setShowSelectRecipe(true)}
						icon={<Bookmark pointerEvents="none" />}
					/>
					<IconButton
						onPress={onUpload}
						icon={<Share pointerEvents="none" />}
					/>
				</View>
			)}
			<View
				style={{
					backgroundColor: colors.off_white,
					paddingVertical: 5,
					zIndex: 10,
				}}
				collapsable={false}
			>
				<RecipeNav
					selectedValue={selectedPage}
					onSelect={(selected) => (
						setSelectedPage(selected),
						scrollToSection(
							selected == 0
								? "overview"
								: selected == 1
									? "ingredients"
									: "directions",
						)
					)}
				/>
			</View>
			<View style={{ gap: 40, paddingTop: 20 }}>
				<View
					onLayout={(e) => {
						sectionPositions.current["overview"] =
							e.nativeEvent.layout.y;
					}}
				>
					<Overview
						mode={mode}
						servings={servingString}
						setServings={onServingChange}
					/>
				</View>
				<View
					onLayout={(e) => {
						sectionPositions.current["ingredients"] =
							e.nativeEvent.layout.y;
					}}
				>
					<Ingredients
						mode={mode}
						servings={servingString}
						setServings={onServingChange}
						canModifyIngredient={canModifyIngredient}
						addIngredient={() =>
							router.push(
								"/(tabs)/(logs)/HandleModifyRecipe/AddIngredientModify",
							)
						}
					/>
				</View>
				<View
					onLayout={(e) => {
						sectionPositions.current["directions"] =
							e.nativeEvent.layout.y;
					}}
				>
					<Directions mode={mode} />
				</View>
			</View>

			<Modal
				visible={showSelectRecipe}
				transparent
				animationType="fade"
				onRequestClose={() => {
					setShowSelectRecipe(false);
				}}
			>
				<SelectRecipeBook
					onSelect={(selected) => AddRecipeBookItem(selected?.id)}
					onCreateNew={() => setShowCreateRecipe(true)}
					recipeBookList={recipeBookList}
					onClose={() => setShowSelectRecipe(false)}
				/>
			</Modal>
			<Modal
				visible={showCreateRecipe}
				transparent
				animationType="fade"
				onRequestClose={() => {
					setShowCreateRecipe(false);
				}}
			>
				<CreateRecipeBook
					setText={(newName) => createRecipeBook(newName)}
					onClose={() => setShowCreateRecipe(false)}
					error={""}
				/>
			</Modal>
		</ScrollView>
	);
};

export default RecipeInfoCore;
