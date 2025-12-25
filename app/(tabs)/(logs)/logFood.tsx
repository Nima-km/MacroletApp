import FindFood from '@/components/findFoodTabs/FindFood';
import { useInsertFoodItems } from '@/db/hooks/food/useFoodItem';
import { FoodFullData } from '@/types/food';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const logFood = () => {
    
    const { mutate: logFoodItems, isPending: logFoodItemsPending, error : logFoodItemsError, isSuccess: logFoodItemsSuccess} = useInsertFoodItems()
    const router = useRouter();
    function onFoodCardID(food_id: number) {
        console.log('onFoodCardID id is', food_id)
        router.push({
            pathname: '/food',
            params: { food_id: food_id },
        })
    }
    function onLogFoodList(foodObject: FoodFullData[]) {
        
        const toLog = foodObject.map((item) => {
            return {...item.foodItem, food_id: item.food.id, timestamp: new Date(), id: undefined}
        })
        console.log('FoodFullData', foodObject)
        logFoodItems(toLog, {
            onSuccess: () => {
                console.log('great successs on Log ALl')
                router.back()
            },
            onError: (e) => {
                console.log('error on Log ALl', e)
            }
        })
    }
    return (
        <View style={{flex: 1,}}>
            <FindFood 
                onFoodCardID={onFoodCardID}
                onLogFoodList={onLogFoodList}
            />
            {/*BottomFoodList*/}
            {/*OnFood*/}
        </View>
    )
}

export default logFood

const styles = StyleSheet.create({
})