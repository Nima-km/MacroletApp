import HeaderFood from '@/components/navComponents/HeaderFood'
import FoodInfoCore from '@/components/UIComponents/Modals/FoodInfo/FoodInfoCore'
import { H1 } from '@/components/UIComponents/Typography'
import { useGetFood } from '@/db/hooks/food/useFood'
import { useInsertFoodItem } from '@/db/hooks/food/useFoodItem'
import { useGetFoodServingSize } from '@/db/hooks/servings/useServings'
import { FoodInsert, FoodItemData } from '@/types/food'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

const food = () => {
    const router = useRouter();
    const {food_id, foodItem_id} = useLocalSearchParams();
    const { data: foodData, isLoading: foodDataLoading, error: errorfoodData } = useGetFood(Number(food_id));
    const { data: servingData, isLoading: servingDataLoading, error: errorservingData } = useGetFoodServingSize(Number(food_id));
    const { mutate: logFoodItem, isPending: logFoodItemPending, error : logFoodItemError, isSuccess: logFoodItemSuccess} = useInsertFoodItem()
    const [edit, setEdit] = useState(false)

    function LogNewFood(food: FoodInsert, foodItem: FoodItemData) {
        
        if (foodItem)

            logFoodItem({...foodItem, food_id: Number(food_id)}, {
                onSuccess: () => {
                    console.log(`${food.name} has been logged`)
                    router.push('/(tabs)/(logs)/logs')
                },
                onError: (err) => {
                console.error("Insert failed:", err);
                },
            })
        else {
            console.log(`something went wrong`)
        }
    }
    if (foodDataLoading) {
        return <H1>loading</H1>
    }
    if (foodData == undefined) {
        return <H1>Couldn't Load Food</H1>
    }
    return (
        <View style={{flex: 1}}>
            <HeaderFood title={'View Meal'} isEdit={edit} onEdit={(value) => setEdit(value)} onBack={() => console.log('back pressed')}/>
            <FoodInfoCore
                foodData={foodData[0]}
                servingsData={servingData}
                primaryText={'Log'} primaryButton={LogNewFood}
                edit={edit}
                setEdit={setEdit}
            />
        </View>
    )
}

export default food

const styles = StyleSheet.create({})