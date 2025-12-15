import FindFood from '@/components/findFoodTabs/FindFood';
import { useInsertFoodItems } from '@/db/hooks/food/useFoodItem';
import { FoodInsert } from '@/types/food';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const logFood = () => {
    const { mutate: logFoodItems, isPending: logFoodItemsPending, error : logFoodItemsError, isSuccess: logFoodItemsSuccess} = useInsertFoodItems()

    function onFoodCardID(food_id: number) {
        console.log('onFoodCardID id is ', food_id)
    }
    function onAddFood(foodObject: FoodInsert) {

    }
    return (
        <View style={{flex: 1,}}>
            <FindFood 
                onFoodCardID={onFoodCardID}
                onAddFood={onAddFood}
            />
            {/*BottomFoodList*/}
            {/*OnFood*/}
        </View>
    )
}

export default logFood

const styles = StyleSheet.create({
})