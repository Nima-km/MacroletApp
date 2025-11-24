import { useGetNutriGoals } from '@/db/hooks/goals/nutritionGoal'
import { useGetFoodItemSum } from '@/db/hooks/history/foodItemhistory'
import { useFoodItemSectionList } from '@/db/hooks/history/sectionListFoodItemHistory'
import { Link } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const logs = () => {
    const date = new Date()
    const { data: nutriGoals, isLoading: loadingGoal, error: errorGoal } = useGetNutriGoals();
    const {data: LiveFood, isLoading: liveFoodLoading, error: liveFoodError} = useGetFoodItemSum(
        new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24)
    )
    const { data: slData, isLoading: loadingSectionList, error: errorSectionList } = useFoodItemSectionList(
        new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24)
    );
    return (
        <View>
            <Text>logs</Text>
            <Link href={"/(tabs)/(logs)/logFood"} asChild>
                <TouchableOpacity>
                <Text>NAVIGATE</Text>
                </TouchableOpacity>
            </Link>
        </View>
    )
}

export default logs

const styles = StyleSheet.create({})