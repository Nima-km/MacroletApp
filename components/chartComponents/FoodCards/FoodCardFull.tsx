import { H4, H5, H5_SemiBold, H6 } from '@/components/UIComponents/Typography'
import { colors } from '@/theme'
import { FoodInsert, FoodItemInsert } from '@/types/food'
import React from 'react'
import { StyleSheet, View } from 'react-native'


interface FoodCardProps {
    foodData: FoodInsert,
    foodItemData: FoodItemInsert,
}

const FoodCardFull = () => {
    const protein = 52
    const fat = 28
    const carbs = 10

    return (
        <View style={styles.container}>
            <View style={styles.rowContainer}>
                <H4>Steak and Eggs</H4>
                <H4>764 cal</H4>
            </View>
            <View style={styles.rowContainer}>
                <H5>1 serving</H5>
                <H5>9:32 AM</H5>
            </View>
            <View style={[{flexDirection: 'row'}]}>
                <View style={[styles.progressBar, {backgroundColor: colors.protein, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, flex: protein}]}/>
                <View style={[styles.progressBar, {backgroundColor: colors.carbs, flex: carbs}]}/>
                <View style={[styles.progressBar, {backgroundColor: colors.fat, borderTopRightRadius: 8, borderBottomRightRadius: 8, flex: fat}]}/>
            </View>
            <View style={styles.macroInfo}>
                <View style={styles.macroInfoSub}>
                    <View style={[styles.macroBall, {backgroundColor: colors.protein}]}/>
                    <H5_SemiBold>P</H5_SemiBold>
                    <H6>{protein} g</H6>
                </View>
                <View style={styles.macroInfoSub}>
                    <View style={[styles.macroBall, {backgroundColor: colors.carbs}]}/>
                    <H5_SemiBold>C</H5_SemiBold>
                    <H6>{carbs} g</H6>
                </View>
                <View style={styles.macroInfoSub}>
                    <View style={[styles.macroBall, {backgroundColor: colors.fat}]}/>
                    <H5_SemiBold>F</H5_SemiBold>
                    <H6>{fat} g</H6>
                </View>
            </View>
        </View>
    )
}

export default FoodCardFull

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