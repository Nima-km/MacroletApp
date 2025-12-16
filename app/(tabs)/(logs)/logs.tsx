import FoodCardFull from '@/components/chartComponents/FoodCards/FoodCardFull'
import BarChart from '@/components/chartComponents/MacroCharts/BarChart'
import SwipeableDelete from '@/components/UIComponents/Swipeable/SwipeableDelete'
import { H1, H4 } from '@/components/UIComponents/Typography'
import { useGetNutriGoals } from '@/db/hooks/goals/nutritionGoal'
import { useGetFoodItemSum } from '@/db/hooks/history/foodItemhistory'
import { useFoodItemSectionList } from '@/db/hooks/history/sectionListFoodItemHistory'
import { formatAMPM } from '@/helper/formatTime'
import { colors } from '@/theme'
import { Link } from 'expo-router'
import React from 'react'
import { Pressable, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'




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
            <View style={{backgroundColor: colors.white, padding: 20, gap: 20}}>
                <H1>Calorie Intake</H1>
                <BarChart 
                    goal={{
                        protein: 160,
                        carbs: 200,
                        fat: 80,
                        fiber: 0,
                        calories: 2160
                    }} progress={{
                        protein: 100,
                        carbs: 90,
                        fat: 60,
                        fiber: 0,
                        calories: 1300
                    }}                
                />
            </View>
            <View style={{paddingHorizontal: 20}}>
                <SectionList
                    sections={slData}
                    renderItem={({item}) =>
                        <SwipeableDelete onPress={() => console.log("delete id", item.foodItem.id)}>
                            <Pressable onPress={() => console.log("id", item.foodItem.id)}>
                                <FoodCardFull 
                                    food={item.food}
                                    foodItem={item.foodItem}
                                />
                            </Pressable>
                        </SwipeableDelete>
                    }
                    style={[{paddingVertical: 30}]}
                    keyExtractor={item => item.foodItem.id.toString()}
                    scrollEnabled={false}
                    renderSectionHeader={({section: {title}}) => (
                    <View style={[ {alignItems: 'center', flexDirection: 'row'}]}>
                        <H4>{formatAMPM(title)}</H4>
                        <View
                            style={{
                                backgroundColor: colors.light_gray,
                                height: 1,
                                flex: 1,
                                marginLeft: 20,
                                
                            }}
                        />
                    </View>
                    )}
                    />
            </View>
        </View>
    )
}

export default logs

const styles = StyleSheet.create({})