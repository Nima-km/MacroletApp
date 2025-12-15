import { FoodInsert, FoodItemInsert } from '@/types/food';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import FoodCardSmall from '../chartComponents/FoodCards/FoodCardSmall';
import SwipeableAdd from '../UIComponents/Swipeable/SwipeableAdd';
import { H1 } from '../UIComponents/Typography';


interface FoodData {
  food: FoodInsert & {id: number};
  foodItem: FoodItemInsert;
}

interface RecentComponentProps {
  filteredData?: FoodData[];
  onFoodCardID: (id: number) => void
}

const RecentComponent = ({filteredData, onFoodCardID}: RecentComponentProps) => {

    return (
        <View style={styles.container} /*showsVerticalScrollIndicator={false}*/>
            <H1>Recent </H1>
            <FlatList
                data={filteredData}
                renderItem={({item}) => 
                    <SwipeableAdd onPress={() => console.log('hi')}>
                        <Pressable onPress={() => onFoodCardID(item.food.id)}>
                            <FoodCardSmall 
                                food={item.food}
                                foodItem={item.foodItem}
                            />
                        </Pressable>
                    </ SwipeableAdd>
                }
                keyExtractor={item => item.food.name}
                scrollEnabled={false}
        />
        </View>
    );
}

export default RecentComponent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 8
    },
})