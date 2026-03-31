import BarcodeComponent from "@/components/findFoodTabs/BarcodeComponent";
import QuickAddComponent from "@/components/findFoodTabs/QuickAddComponent";
import RecentComponent from "@/components/findFoodTabs/RecentComponent";
import RecipeComponent from "@/components/findFoodTabs/RecipeComponent";
import { useGetFoodItemRecent } from "@/db/hooks/history/foodItemhistory";
import { FoodFullData, FoodItemData } from "@/types/food";
import { IngredientFullData } from "@/types/recipe";
import BottomSheet from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import NavSelector from "../navComponents/NavSelector";
import FoodBottomSheet from "../UIComponents/BottomSheet/FoodBottomSheet";
import IngredientBottomSheet from "../UIComponents/BottomSheet/IngredientBottomSheet";
import { FormInputSearch } from "../UIComponents/TextInputs/FormInput";
import { H5 } from "../UIComponents/Typography";

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
    const router = useRouter();

    const { pageId } = useLocalSearchParams();
    //router.setParams({ pageId: 0 });

    const isNotRecipe =
        ingredientList == undefined && setIngredientList == undefined;
    const [selectedPage, setSelectedPage] = useState(
        pageId ? Number(pageId) : 0,
    );
    const sheetRef = useRef<BottomSheet>(null);
    const [search, setSearch] = useState("");
    const {
        data: history,
        isLoading: loadingSectionList,
        error: errorSectionList,
    } = useGetFoodItemRecent(isNotRecipe);
    const [filteredData, setFilteredData] = useState(history);

    function onAddFood(item: FoodFullData) {
        if (setFoodList) setFoodList((prev) => [...prev, item]);
        if (setIngredientList) {
            const processed = {
                food: item.food,
                ingredientItem: item.foodItem,
            };
            setIngredientList((prev) => [...prev, processed]);
        }
    }

    const renderPage = useMemo(() => {
        switch (selectedPage) {
            case 0:
                return (
                    <RecentComponent
                        filteredData={filteredData}
                        onFoodCardID={onFoodCardID}
                        onAddFood={onAddFood}
                    />
                );
            case 1:
                return <RecipeComponent />;
            case 2:
                return <BarcodeComponent onScan={onFoodCardID} />;
            case 3:
                return <QuickAddComponent />;
            default:
                return null;
        }
    }, [selectedPage, filteredData]);
    useEffect(() => {
        setFilteredData(
            history
                ?.filter((item) =>
                    item.food.name
                        .toLowerCase()
                        .includes(`${search}`.toLowerCase()),
                )
                .slice(0, 4),
        );
    }, [search, history]);
    useEffect(() => {
        if (pageId) setSelectedPage(Number(pageId));
    }, [pageId]);
    useEffect(() => {
        if (selectedPage != Number(pageId))
            router.setParams({ pageId: selectedPage });
    }, [selectedPage]);
    if (loadingSectionList) {
        return <H5>{loadingSectionList}</H5>;
    }
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={{ paddingHorizontal: 20 }}>
                    <FormInputSearch
                        style={{ paddingHorizontal: 20 }}
                        value={search}
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
                <View style={{ flex: 1 }}>{renderPage}</View>
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
