import FindFood from '@/components/findFoodTabs/FindFood';
import { useInsertFoodItems } from '@/db/hooks/food/useFoodItem';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const logFood = () => {
    const { mutate: logFoodItems, isPending: logFoodItemsPending, error : logFoodItemsError, isSuccess: logFoodItemsSuccess} = useInsertFoodItems()
    return (
        <View>
            <Text>logFood</Text>
            <FindFood/>
        </View>
    )
}

export default logFood

const styles = StyleSheet.create({})