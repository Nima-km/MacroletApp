import Bin from '@/assets/svg/bin.svg';
import Swap from '@/assets/svg/swap.svg';
import { SimpleChartCarbsSmall, SimpleChartFatSmall, SimpleChartProteinSmall } from '@/components/chartComponents/SimpleChart/SimpleChartSmall';
import { colors } from '@/theme';
import { FoodType } from '@/types/food';
import { IngredientItemDetails } from '@/types/recipe';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { InlineButton, PrimaryButton, SecondaryButton } from '../Buttons/Button';
import DropdownCore, { DropdownOption } from '../DropDown/DropDownCore';
import { FormInputNumber } from '../TextInputs/FormInput';
import { H1, H4, H5_SemiBold } from '../Typography';
import ModalCore from './ModalCore';

interface AddIngredientProps {
    foodData: FoodType;
    ingredientData: Omit<IngredientItemDetails, 'prep_notes' | 'display_name'>;
    options: DropdownOption[];
    selectedOption: number;
    setIngredient: (ingredientItem: Omit<IngredientItemDetails, 'prep_notes' | 'display_name'>) => void;
    onClose: () => void
    onSwap: () => void
    onDelete: () => void
}

const IngredientModal = ({foodData, ingredientData, options, selectedOption, onClose, onSwap, onDelete, setIngredient}: AddIngredientProps) => {
    const [servingAmount, setServingAmount] = useState(ingredientData.servings.toString())
    const [selectedServing, setSelectedServing] = useState(options[selectedOption])
    
    const total_macro = (foodData.carbs + foodData.fat + foodData.protein) * Number(servingAmount) * selectedServing.value
    function onSave() {
        
        setIngredient({serving_mult: selectedServing.value, serving_type: selectedServing.label, servings: Number(servingAmount)})
    }
    const calories = calculate_final((foodData.carbs + foodData.protein) * 4 + foodData.fat * 9 - foodData.fiber * 2)

    function calculate_final(inp: number) {
        return inp * Number(servingAmount) * selectedServing.value
    }
    return (
        <ModalCore title={foodData.name}>
            <View style={{flexDirection: 'column-reverse'}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
                    <InlineButton style={{justifyContent: 'center'}} onPress={onSwap}>
                        <Swap width={20} height={20} />
                        <View style={{paddingLeft: 9}}>
                            <H5_SemiBold style={{color: colors.primary, textDecorationLine: 'underline'}}>
                                Swap ingredient
                            </H5_SemiBold>
                        </View>
                    </InlineButton>
                    <Pressable onPress={onDelete}>
                        <Bin width={24} height={24}/>
                    </Pressable>
                </View>
                <View style={styles.buttonsContainer}>
                    <View style={{flex: 1,}}>
                        <SecondaryButton onPress={() => {onClose()}}>
                            Reset
                        </SecondaryButton>
                    </View>
                    <View style={{flex: 1,}}>
                        <PrimaryButton onPress={() => {onSave(), onClose()}}>
                            Update
                        </PrimaryButton>
                    </View>
                    
                </View>
                <View style={styles.mainContent}>
                    
                    <View style={{alignItems: 'flex-end'}}>
                        <InlineButton>
                            <H5_SemiBold style={{color: colors.primary}}>
                                View All Nutrition
                            </H5_SemiBold>
                        </InlineButton>
                    </View>
                    <View style={[styles.rowContainer, {marginBottom: 20}]}>
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <H1>
                                {Math.floor(calories)}
                            </H1>
                            <H4>
                                Calories
                            </H4>
                        </View>
                        <View style={styles.chartsContainer}>
                            <SimpleChartProteinSmall target={total_macro} progress={calculate_final(foodData.protein)} backgroundColor={colors.white} />
                            <SimpleChartCarbsSmall target={total_macro} progress={calculate_final(foodData.carbs)} backgroundColor={colors.white} />
                            <SimpleChartFatSmall target={total_macro} progress={calculate_final(foodData.fat)} backgroundColor={colors.white} />
                        </View>
                    </View>
                    
                    <View style={[styles.rowContainer, {marginBottom: 20}]}>

                        <View style={styles.ratioTextContainer}>
                            <FormInputNumber
                                onChangeText={setServingAmount}
                                value={servingAmount}
                            />
                        </View>
                        <View style={styles.referenceServingContainer}>
                            <DropdownCore options={options} placeholder={options[0].label} onSelect={setSelectedServing}/>
                        </View>
                    </View>
                </View>
            </View>
        </ModalCore>
    )
}

export default IngredientModal

const styles = StyleSheet.create({
    mainContent: {
        marginVertical: 20,
        flexDirection: 'column-reverse'
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chartsContainer: {
        flexDirection: 'row',
        marginLeft: 20,
        alignItems: 'center',
        gap: 20,
    },
    nameTextContainer: {
        flex: 1
    },
    ratioTextContainer: {
        height: 46,
        width: 75,
    },
    referenceServingContainer: {
        height: 46,
        flex: 1,
    },
})