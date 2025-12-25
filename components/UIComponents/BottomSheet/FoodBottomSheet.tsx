import FoodCardQuick from '@/components/chartComponents/FoodCards/FoodCardQuick'
import { useFoodBottomSheetStore } from '@/store/useStore'
import { colors } from '@/theme'
import { FoodFullData } from '@/types/food'
import BottomSheet from '@gorhom/bottom-sheet'
import React, { forwardRef, useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { H5_SemiBold } from '../Typography'
import { BottomSheetCore } from './BottomSheetCore'
import FoodBottomSheetFooter from './FoodBottomSheetFooter'



interface FoodBottomSheetProps {
    foodFullData: FoodFullData[]
    onLogAll: (foodObject: FoodFullData[]) => void
    onRemove: (index: number) => void
}



const FoodBottomSheet = forwardRef<BottomSheet, FoodBottomSheetProps>(({foodFullData, onRemove, onLogAll}, ref) => {

        
    
    const setFoodFullData = useFoodBottomSheetStore((s) => s.setFoodFullData);
    useEffect(() => {
        if (setFoodFullData) {
            setFoodFullData(foodFullData ?? [])
        }
    }, [foodFullData])
    if (foodFullData.length == 0) {
        return <View></View>
    }
    return (
        <BottomSheetCore ref={ref} 
            footer={<FoodBottomSheetFooter onLogAll={onLogAll}/>}
            header={
                foodFullData?.length > 0
                ? <H5_SemiBold style={{color: colors.primary}}>
                    {foodFullData?.length} food{foodFullData?.length > 1 ? 's' : ''} selected
                </H5_SemiBold>
                : null
                }
        >
            <View style={{flex: 1, justifyContent: 'space-between'}}>
                
                <FlatList 
                    data={foodFullData}
                        renderItem={({item, index}) => 
                            <Pressable onPress={() => {}}>
                                <FoodCardQuick 
                                    food={item.food}
                                    foodItem={item.foodItem}
                                    onRemove={() => onRemove(index)}
                                /> 
                            </Pressable>
                        }
                    //keyExtractor={(item, index) => item.food.name + index.toString()}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={{height: 1, flex: 1, backgroundColor: colors.primary_bg, marginHorizontal: 20}}/>}
                />
                
            </View>
        </BottomSheetCore>
    );
});
export default FoodBottomSheet

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
    },
    chartsContainer: {
        flexDirection: 'row',
        marginLeft: 20,
        flex: 1,
        justifyContent: 'space-around',
    },
})