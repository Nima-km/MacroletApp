import HeaderSimple from '@/components/navComponents/HeaderSimple'
import FoodInfoCore from '@/components/UIComponents/Modals/FoodInfo/FoodInfoCore'
import { H1 } from '@/components/UIComponents/Typography'
import { useGetFood } from '@/db/hooks/food/useFood'
import { useGetFoodItem, useInsertFoodItem, useUpdateFoodItem } from '@/db/hooks/food/useFoodItem'
import { useGetFoodServingSize } from '@/db/hooks/servings/useServings'
import { FoodInsert, FoodItemData } from '@/types/food'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

const foodItem = () => {
    const router = useRouter();
    const {food_id, foodItem_id} = useLocalSearchParams();
    const { data: foodData, isLoading: foodDataLoading, error: errorfoodData } = useGetFood(Number(food_id));
    const { data: foodItemData, isLoading: foodItemDataLoading, error: errorfoodItemData } = useGetFoodItem(Number(foodItem_id));
    const { data: servingData, isLoading: servingDataLoading, error: errorservingData } = useGetFoodServingSize(Number(food_id));
    const { mutate: logFoodItem, isPending: logFoodItemPending, error : logFoodItemError, isSuccess: logFoodItemSuccess} = useInsertFoodItem()
    const { mutate: updateFoodItem, isPending: updateFoodItemPending, error : updateFoodItemError, isSuccess: updateFoodItemSuccess} = useUpdateFoodItem()
    const [edit, setEdit] = useState(false)
    if (foodDataLoading || foodItemDataLoading) {
        return <H1>loading</H1>
    }
    if (foodData == undefined || foodItemData == undefined) {
        return <H1>Couldn't Load Food</H1>
    }
    function LogNewFood(food: FoodInsert, foodItem: FoodItemData) {
        console.log(foodItem)
        if (foodItem)
            logFoodItem({...foodItem, food_id: Number(food_id), id: undefined}, {
                onSuccess: () => {
                    console.log(`${food.name} has been logged`)
                    router.back()
                },
                onError: (err) => {
                console.error("Insert failed:", err);
                },
            })
        else {
            console.log(`something went wrong`)
        }
    }
    function LogUpdateFoodItem(food: FoodInsert, foodItem: FoodItemData) {
        if (foodItem)
            updateFoodItem({data: foodItem, id: Number(foodItem_id)}, {
                onSuccess: () => {
                    console.log(`${food.name} has been logged`)
                    router.replace('/(tabs)/(logs)/logs')
                },
                onError: (err) => {
                console.error("Insert failed:", err);
                },
            })
        else {
            console.log(`something went wrong`)
        }
    }
    return (
        <View style={{flex: 1}}>
            <HeaderSimple title={'View Meal'}/>
            <FoodInfoCore
                foodData={foodData[0]}
                foodItemData={foodItemData[0]}
                servingsData={servingData}
                primaryText={'Update'} primaryButton={LogUpdateFoodItem}
                secondaryText={'Log New'} secondaryButton={LogNewFood}
                edit={edit}
                setEdit={setEdit}
            />
        </View>
    )
}

export default foodItem

const styles = StyleSheet.create({})