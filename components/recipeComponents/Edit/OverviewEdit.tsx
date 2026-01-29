import { FormInputNumber } from '@/components/UIComponents/TextInputs/FormInput'
import { calculateCalories } from '@/helper/calculateCalories'
import { macroSum } from '@/helper/calculateMacro'
import { CalculateMacroSumIngredient } from '@/helper/recipeMacroSum'
import { RecipeDraftType } from '@/store/recipeStore/useRecipeStore'
import { colors } from '@/theme'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SimpleChartCarbsMacro, SimpleChartFatMacro, SimpleChartProteinMacro } from '../../chartComponents/SimpleChart/SimpleChartMacro'
import PrepCookButton from '../../UIComponents/Buttons/PrepCookButton'
import ExpandableTextInput from '../../UIComponents/TextInputs/ExpandableTextInput'
import { H1, H2, H3, H6 } from '../../UIComponents/Typography'

type Props = {
    recipeObject: RecipeDraftType
}

const OverviewEdit = ({recipeObject} : Props) => {
    const foodData = CalculateMacroSumIngredient(recipeObject.data.ingredientItemsData)
    const [servingsYield, setServingsYield] = useState(recipeObject.data.recipeData.servings_yield?.toString() ?? '')
    function calculate_final(inp: number) {
        const mult = recipeObject.data.recipeData.servings_yield
        if (mult == 0 || mult == undefined)
            return inp
        else
            return inp / mult
    }
    useEffect(() => {
        console.log('recipe changed', foodData)
    }, [recipeObject])
    function onServingChange(text: string) {
        setServingsYield(text)
        recipeObject.updateRecipe('servings_yield', Number(text))
    }
    const calories = calculateCalories(foodData)
    const total_macro = macroSum(foodData)
    return (
        <View style={{flex: 1, gap: 24}}>
            <PrepCookButton 
                prepTime={recipeObject.data.recipeData.prep_time ?? 0}
                cookTime={recipeObject.data.recipeData.cook_time ?? 0}
                setCookTime={(hour, mins) => recipeObject.updateRecipe('cook_time', (Number(hour) * 60 + Number(mins)))} 
                setPrepTime={(hour, mins) => recipeObject.updateRecipe('prep_time', (Number(hour) * 60 + Number(mins)))} 
            />
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <H1>
                        {Math.floor(calculate_final(calories))} cal
                    </H1>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8}}>
                    <H3 style={{color: colors.primary}}>
                        Servings Yield
                    </H3>
                    <FormInputNumber
                        value={servingsYield}
                        onChangeText={onServingChange}
                    />
                </View>
            </View>
            <H6>
                Nutritional information shown are per serving
            </H6>
            <View style={styles.chartsContainer}>
                    
                <SimpleChartProteinMacro target={(total_macro)} progress={calculate_final(recipeObject.data.foodData.protein ?? 0)} backgroundColor={colors.white} />
                <SimpleChartCarbsMacro target={total_macro} progress={calculate_final(recipeObject.data.foodData.carbs ?? 0)} backgroundColor={colors.white} />
                <SimpleChartFatMacro target={total_macro} progress={calculate_final(recipeObject.data.foodData.fat ?? 0)} backgroundColor={colors.white} />
            </View>
            <View style={{flexDirection: 'row'}}>
                <H2>
                    Overview
                </H2>
            </View>
            <View>
                <ExpandableTextInput 
                    placeholder={'Add Recipe Notes'}
                    value={recipeObject.data.recipeData.note ?? ''}
                    onChangeText={(text) => recipeObject.updateRecipe('note', text)}
                />
            </View>
        </View>
    )
}

export default OverviewEdit

const styles = StyleSheet.create({
    chartsContainer: {
        flexDirection: 'row',
        
        //alignItems: 'center',
        justifyContent: 'space-between',
        //gap: 20,
    },
})