import FoodSVG from "@/assets/svg/foods.svg"
import FoodCardFull from '@/components/chartComponents/FoodCards/FoodCardFull'
import BarChart from '@/components/chartComponents/MacroCharts/BarChart'
import HeaderSimple from "@/components/navComponents/HeaderSimple"
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button"
import SwipeableDelete from '@/components/UIComponents/Swipeable/SwipeableDelete'
import { H1, H4 } from '@/components/UIComponents/Typography'
import { useDeleteFoodItem } from '@/db/hooks/food/useFoodItem'
import { useGetNutriGoals } from '@/db/hooks/goals/nutritionGoal'
import { useGetFoodItemSum } from '@/db/hooks/history/foodItemhistory'
import { useFoodItemSectionList } from '@/db/hooks/history/sectionListFoodItemHistory'
import { formatAMPM } from '@/helper/formatTime'
import { colors } from '@/theme'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, ScrollView, SectionList, StyleSheet, View } from 'react-native'




const logs = () => {
    const date = new Date()
    const router = useRouter();
    const { data: nutriGoals, isLoading: loadingGoal, error: errorGoal } = useGetNutriGoals();
    const {data: LiveFood, isLoading: liveFoodLoading, error: liveFoodError} = useGetFoodItemSum(
        new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24)
    )
    const { data: slData, isLoading: loadingSectionList, error: errorSectionList } = useFoodItemSectionList(
        new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 24)
    );
    const {mutate: deleteFoodItem} = useDeleteFoodItem()
    function onDelete(foodItem_id: number) {
        deleteFoodItem(foodItem_id, {
            onSuccess: (item) => {
                console.log(`Removed from history`)
            //  context.setDate(new Date(context.date.getDate() + 1)) FOR DEBUGGING
            },
            onError: (item) => {
                console.log(`Something Went Wrong`, item)
            }
        })
    }
    function onPressCard(food_id: number, foodItem_id: number) {
        console.log('onFoodCardID id is', food_id)
        router.push({
            pathname: '/foodItem',
            params: { food_id, foodItem_id },
        })
    }
    if (liveFoodLoading || loadingGoal) {
        return <H1>Loading</H1>
    }
    return (
        <View style={{flex: 1}}>
            <HeaderSimple title="MACROLET"/>
            <ScrollView>
                
                <View style={{backgroundColor: colors.white, padding: 20, gap: 20}}>
                    <H1>Calorie Intake</H1>
                    <BarChart 
                        goal={{
                            protein: 160,
                            carbs: 200,
                            fat: 80,
                            fiber: 0,
                            calories: 2160
                        }} 
                        progress={LiveFood?.[0]}
                    />
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20}}>
                        <View style={{justifyContent: 'flex-end', gap: 20}}>
                            <H4>
                                PROTEIN
                            </H4>
                            <H4>
                                CARBS
                            </H4>
                            <H4>
                                FAT
                            </H4>
                        </View>
                        <View style={{justifyContent: 'flex-end', gap: 20}}>
                            <H4>
                                TOTAL
                            </H4>
                            <H4>
                                {LiveFood?.[0]?.protein ?? 0} g
                            </H4>
                            <H4>
                                {LiveFood?.[0]?.carbs ?? 0} g
                            </H4>
                            <H4>
                                {LiveFood?.[0]?.fat ?? 0} g
                            </H4>
                        </View>
                        <View style={{justifyContent: 'flex-end', gap: 20}}>
                            <H4>
                                GOAL
                            </H4>
                            <H4>
                                {nutriGoals?.[0]?.protein ?? 0} g
                            </H4>
                            <H4>
                                {nutriGoals?.[0]?.carbs ?? 0} g
                            </H4>
                            <H4>
                                {nutriGoals?.[0]?.fat ?? 0} g
                            </H4>
                        </View>
                        
                    </View>
                </View>
                <View style={{paddingHorizontal: 20}}>
                    <SectionList
                        sections={slData}
                        renderItem={({item}) =>
                            <SwipeableDelete onPress={() => onDelete(item.foodItem.id)}>
                                <Pressable onPress={() => onPressCard(item.food.id, item.foodItem.id)}>
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
                    {slData.length == 0 &&
                        <View style={{justifyContent: 'center', alignItems: 'center', marginBottom: 20}}>
                            <FoodSVG height={110} width={110} style={{}}/>
                            <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 14}}>
                            <H4 style={[{color: colors.inactive}]}>No meals logged yet.</H4>
                            <H4 style={[{color: colors.inactive, marginTop: 4}]}>Add your first meal here!</H4>
                            </View>
                        </View>
                    }
                    <PrimaryButton onPress={() => router.push("/(tabs)/(logs)/logFood")}>
                        + Add
                    </PrimaryButton>
                </View>
            </ScrollView>
        </View>
    )
}

export default logs

const styles = StyleSheet.create({})