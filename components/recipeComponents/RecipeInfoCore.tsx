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
import { useRecipeStateStore } from "@/store/recipeStore/useRecipeStore";
import { colors } from "@/theme";
import { RecipeData } from "@/types/recipe";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Modal, View } from "react-native";
import IconButton from "../UIComponents/Buttons/IconButton";
import CreateRecipeBook from "../UIComponents/Modals/CreateRecipeBook";
import SelectRecipeBook from "../UIComponents/Modals/SelectRecipeBook";

interface Props {
    servings: number;
    canModifyIngredient?: boolean;
    setServings: (newServing: number) => void;
    onLogRecipe?: () => void;
    onUploadRecipe?: () => void;
}

const RecipeInfoCore = ({
    servings,
    canModifyIngredient = true,
    setServings,
    onLogRecipe,
    onUploadRecipe,
}: Props) => {
    const { getToken, has } = useAuth();
    const ingredientItemsData = useRecipeStateStore(
        (state) => state.data.ingredientItemsData,
    );
    const recipeFullData = useRecipeStateStore((state) => state.data);
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

    const foodData = useRecipeStateStore((state) => state.data.foodData);
    const recipeData = useRecipeStateStore((state) => state.data.recipeData);
    const router = useRouter();
    const [selectedPage, setSelectedPage] = useState(0);
    const [servingString, setServingString] = useState(servings.toString());

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
    const renderPage = useMemo(() => {
        switch (selectedPage) {
            case 0:
                return (
                    <Overview
                        servings={servingString}
                        setServings={onServingChange}
                    />
                );
            case 1:
                return (
                    <Ingredients
                        servings={servingString}
                        setServings={onServingChange}
                        canModifyIngredient={canModifyIngredient}
                        addIngredient={() =>
                            router.push(
                                "/(tabs)/(logs)/HandleModifyRecipe/AddIngredientModify",
                            )
                        }
                    />
                );
            case 2:
                return <Directions />;
            default:
                return null;
        }
    }, [selectedPage, servings, foodData]);
    console.log("canmodifyingredient, recipeInfoCore", canModifyIngredient);
    return (
        <View style={{ flex: 1 }}>
            <View
                style={{ backgroundColor: colors.primary_bg, height: 180 }}
            ></View>
            <View
                style={{
                    flex: 1,

                    paddingTop: 12,
                    gap: 20,
                }}
            >
                <View style={{ gap: 12, flex: 1, paddingHorizontal: 20 }}>
                    <H2>{foodData.name}</H2>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <H5 style={{ color: colors.medium_gray }}>
                            Private recipe
                        </H5>
                        <SubButton>Shrimp</SubButton>
                        <SubButton>Chinese</SubButton>
                    </View>
                    <H5 style={{ color: colors.medium_gray }}>
                        {recipeData.description}
                    </H5>
                    {onLogRecipe && (
                        <View
                            style={{
                                flexDirection: "row",
                                paddingVertical: 12,
                                gap: 8,
                            }}
                        >
                            <PrimaryButton
                                style={{ flex: 1 }}
                                onPress={onLogRecipe}
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
                    <View style={{ flex: 1, gap: 20 }}>
                        <RecipeNav
                            selectedValue={selectedPage}
                            onSelect={setSelectedPage}
                        />
                        {renderPage}
                    </View>
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
        </View>
    );
};

export default RecipeInfoCore;
