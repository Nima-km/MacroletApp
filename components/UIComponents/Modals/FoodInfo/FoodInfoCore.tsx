import { SimpleChartCarbsMacro, SimpleChartFatMacro, SimpleChartProteinMacro } from '@/components/chartComponents/SimpleChart/SimpleChartMacro';
import { calculateCalories } from '@/helper/calculateCalories';
import { FoodItemDefault, TestFood2 } from '@/tests/testData';
import { FoodInsert, FoodItemData } from '@/types/food';
import { ServingSizeRaw } from '@/types/servingSize';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DateButton, PrimaryButton, SecondaryButton } from '../../Buttons/Button';
import DropDownServings from '../../DropDown/DropDownServings';
import { FormInput } from '../../TextInputs/FormInput';
import { H1 } from '../../Typography';


interface FoodInfoProps {
    foodData?: FoodInsert;
    foodItemData?: FoodItemData & Required<Pick<FoodItemData, "timestamp">>;
    servingsData?: ServingSizeRaw[];
    primaryText: string 
    secondaryText?: string
    edit?: boolean,
    primaryButton: (food: FoodInsert, foodItem: FoodItemData) => void
    secondaryButton?: (food: FoodInsert, foodItem: FoodItemData) => void

}

const FoodInfoCore = ({foodData, foodItemData, servingsData, primaryText, secondaryText, primaryButton, secondaryButton, edit = false}: FoodInfoProps) => {
    const [food, setFood] = useState(foodData ?? TestFood2)
    const [foodItem, setFoodItem] = useState(
        foodItemData ?? FoodItemDefault
    )
    console.log('serving', foodItem.serving_type)
    return (
        <View style={{flex: 1, padding: 20, gap: 20}}>
            {edit
                ?   <FormInput value={food.name} onChangeText={(newName) => setFood(prev => ({ ...prev, name: newName }))}/>
                :   <H1>{food.name}</H1>
            }
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <H1>{calculateCalories(food) * foodItem.serving_mult * foodItem.servings}</H1>
                <DateButton>
                    Today, 9:32 PM
                </DateButton>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <SimpleChartProteinMacro target={150} progress={90} backgroundColor={'black'}/>
                <SimpleChartCarbsMacro target={150} progress={90} backgroundColor={'black'}/>
                <SimpleChartFatMacro target={150} progress={90} backgroundColor={'black'}/>
            </View>
            <DropDownServings 
                options={servingsData ?? []}
                placeholder={foodItem.serving_type}
                servings={foodItem.servings.toString()} 
                extraButton={() => console.log('extra button pressed')}
                setServings={(servings) => setFoodItem(prev => ({ ...prev, servings: Number(servings) }))}
            />
            <View style={{flexDirection: 'row', gap: 8}}>
                { secondaryButton &&
                    <SecondaryButton style={{flex: 1,}} onPress={() => secondaryButton(food, foodItem)}>
                        {secondaryText}
                    </SecondaryButton>
                }
                <PrimaryButton style={{flex: 1,}} onPress={() => primaryButton(food, foodItem)}>
                    {primaryText}
                </PrimaryButton>
            </View>
        </View>
    )
}

export default FoodInfoCore

const styles = StyleSheet.create({

})