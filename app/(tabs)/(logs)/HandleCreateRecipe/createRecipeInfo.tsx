import HeaderSimple from '@/components/navComponents/HeaderSimple';
import { PrimaryButton } from '@/components/UIComponents/Buttons/Button';
import KeyboardAware from '@/components/UIComponents/KeyboardAware/KeyboardAware';
import { FormInput, FormInputLong } from '@/components/UIComponents/TextInputs/FormInput';
import { H4 } from '@/components/UIComponents/Typography';
import { useRecipeDraftStore } from '@/store/recipeStore/useRecipeStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const createRecipeInfo = () => {
    const router = useRouter()
    const { data: draft, updateRecipe, updateFood, updateIngredient } = useRecipeDraftStore();

    return (
        <KeyboardAware>
            <View style={{flex: 1}}>
                <HeaderSimple title='CREATE RECIPE'/>
                <View style={{padding: 20, flex: 1, gap: 32}}>
                    <FormInput 
                        value={draft.foodData.name ?? ''}
                        placeholder='Enter recipe name'
                        error={undefined}
                        onChangeText={(text) => updateFood("name", text)}
                    />
                    <View style={{gap: 12}}>
                        <H4>
                            Description
                        </H4>
                        <FormInputLong
                            value={draft.recipeData.description ?? ''}
                            placeholder='Enter recipe name'
                            error={undefined}
                            onChangeText={(text) => updateRecipe("description", text)}
                        />
                    </View>
                    <View style={{gap: 12}}>
                        <H4>
                            Tags
                        </H4>
                        <FormInputLong
                            value={draft.recipeData.description ?? ''}
                            placeholder='Write a short description for your recipe'
                            error={undefined}
                            onChangeText={(text) => updateRecipe("description", text)}
                        />
                    </View>
                    
                </View>
                <PrimaryButton style={{marginHorizontal: 20}} onPress={() => router.push('/(tabs)/(logs)/HandleCreateRecipe/createRecipe')}>
                    Continue
                </PrimaryButton>
            </View>
        </KeyboardAware>
    )
}

export default createRecipeInfo

const styles = StyleSheet.create({})