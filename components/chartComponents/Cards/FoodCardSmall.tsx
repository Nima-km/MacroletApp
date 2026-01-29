import { H4, H5_SemiBold, H6 } from '@/components/UIComponents/Typography'
import { calculateCalories } from '@/helper/calculateCalories'
import { calculateMacro } from '@/helper/calculateMacro'
import { colors } from '@/theme'
import { FoodFullData } from '@/types/food'
import React from 'react'
import { StyleSheet, View } from 'react-native'


const FoodCardSmall = ({food, foodItem} : FoodFullData) => {
    const foodData = calculateMacro(food, foodItem.serving_mult * foodItem.servings)
    return (
        <View style={styles.container}>
            <View style={styles.rowContainer}>
                <H4>{food.name}</H4>
                <H4>{foodItem.servings} serving{foodItem.servings > 1 && 's'}</H4>
            </View>
            <View style={[{flexDirection: 'row'}]}>
                <View style={[styles.progressBar, {backgroundColor: colors.protein, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, flex: food.protein}]}/>
                <View style={[styles.progressBar, {backgroundColor: colors.carbs, flex: food.carbs}]}/>
                <View style={[styles.progressBar, {backgroundColor: colors.fat, borderTopRightRadius: 8, borderBottomRightRadius: 8, flex: food.fat}]}/>
            </View>
            <View style={styles.macroInfo}>
                <View style={styles.macroInfoSub}>
                    <H5_SemiBold>{calculateCalories(foodData)} cal</H5_SemiBold>
                </View>
                <View style={styles.macroInfoSub}>
                    <View style={[styles.macroBall, {backgroundColor: colors.protein}]}/>
                    <H5_SemiBold>P</H5_SemiBold>
                    <H6>{foodData.protein} g</H6>
                </View>
                <View style={styles.macroInfoSub}>
                    <View style={[styles.macroBall, {backgroundColor: colors.carbs}]}/>
                    <H5_SemiBold>C</H5_SemiBold>
                    <H6>{foodData.carbs} g</H6>
                </View>
                <View style={styles.macroInfoSub}>
                    <View style={[styles.macroBall, {backgroundColor: colors.fat}]}/>
                    <H5_SemiBold>F</H5_SemiBold>
                    <H6>{foodData.fat} g</H6>
                </View>
            </View>
        </View>
    )
}

export default FoodCardSmall

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 8,
        gap: 8
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    progressBar: {
        height: 15,
    },
    macroInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    macroInfoSub: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 8,
    },
    macroBall: {
        width: 10,
        height: 10,
        borderRadius: 10,
    }
})