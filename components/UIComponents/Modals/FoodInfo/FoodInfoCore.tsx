import { FoodDefault, FoodItemDefault } from '@/tests/testData';
import { FoodInsert, FoodItemInsert } from '@/types/food';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { H1 } from '../../Typography';


interface FoodInfoProps {
    foodData?: FoodInsert;
    foodItemData?: FoodItemInsert & Required<Pick<FoodItemInsert, "timestamp">>;
}

const FoodInfoCore = ({foodData, foodItemData}: FoodInfoProps) => {
    const [food, setFood] = useState(foodData ?? FoodDefault)
    const [foodItem, setFoodItem] = useState(
        foodItemData ?? FoodItemDefault
    )
    return (
        <View style={{flex: 1}}>
            <H1>{food.name}</H1>
        </View>
    )
}

export default FoodInfoCore

const styles = StyleSheet.create({

})