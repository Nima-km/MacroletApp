import FindFood from "@/components/findFoodTabs/FindFood";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import QuickAddIngredientModal from "@/components/UIComponents/Modals/QuickAddIngredientModal";
import { useGetFood } from "@/db/hooks/food/useFood";
import { DefaultServings } from "@/tests/testData";
import { IngredientFullData } from "@/types/recipe";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";

const AddIngredientModify = () => {
    const router = useRouter();
    const [selectedFoodID, setSelectedFoodID] = useState<number | null>(null);
    const [servingsData, setServingsData] = useState([]);
    const [foodList, setFoodList] = useState<IngredientFullData[]>([]);
    const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
    const {
        data: foodData,
        isLoading: foodDataLoading,
        error: errorfoodData,
    } = useGetFood(selectedFoodID ?? undefined, !!selectedFoodID);
    function onFoodCardID(food_id: number) {
        console.log("onFoodCardID id is", food_id, foodData);

        setSelectedFoodID(food_id);
        setIngredientModalVisible(true);
    }
    const onLogFoodList = () => {
        router.back();
    };
    useEffect(() => {
        if (foodData) {
            console.log("food data in AddIngredient", foodData[0]);
        }
    }, [foodData]);
    useEffect(() => {
        if (foodList) {
            console.log("food data in AddIngredient", foodList[0]);
        }
    }, [foodList]);
    return (
        <View style={{ flex: 1 }}>
            <HeaderSimple title={"Add Ingredient"} />
            <FindFood
                onFoodCardID={onFoodCardID}
                onLogFoodList={onLogFoodList}
                ingredientList={foodList}
                setIngredientList={setFoodList}
            />
            {foodData && (
                <Modal
                    visible={ingredientModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => {
                        setIngredientModalVisible(false);
                    }}
                >
                    <QuickAddIngredientModal
                        foodData={foodData[0]}
                        options={[...DefaultServings, ...(servingsData ?? [])]}
                        setIngredient={(item) =>
                            setFoodList((prev) => [...prev, item])
                        }
                        onClose={() => setIngredientModalVisible(false)}
                    />
                </Modal>
            )}
        </View>
    );
};

export default AddIngredientModify;

const styles = StyleSheet.create({});
