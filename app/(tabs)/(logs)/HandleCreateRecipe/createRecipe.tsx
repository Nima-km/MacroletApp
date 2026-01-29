import HeaderSimple from '@/components/navComponents/HeaderSimple'
import DirectionsEdit from '@/components/recipeComponents/Edit/DirectionsEdit'
import IngredientsEdit from '@/components/recipeComponents/Edit/IngredientsEdit'
import OverviewEdit from '@/components/recipeComponents/Edit/OverviewEdit'
import RecipeNav from '@/components/recipeComponents/RecipeNav'
import { PrimaryButton, SubButton } from '@/components/UIComponents/Buttons/Button'
import KeyboardAware from '@/components/UIComponents/KeyboardAware/KeyboardAware'
import { H2, H5 } from '@/components/UIComponents/Typography'
import { useRecipeDraftStore } from '@/store/recipeStore/useRecipeStore'
import { colors } from '@/theme'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

const createRecipe = () => {
    const router = useRouter()
    const [selectedPage, setSelectedPage] = useState(0);
    const draft = useRecipeDraftStore();

    return (
        <KeyboardAware>
            <HeaderSimple title='Create Recipe'/>
            <View style={{backgroundColor: colors.primary_bg, height: 180}}>

            </View>
            <View style={{flex: 1, paddingHorizontal: 20, paddingTop: 12, gap: 20}}>
                <View style={{gap: 12, flex: 1}}>
                    <H2 >
                        {draft.data.foodData.name}
                    </H2>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <H5 style={{color: colors.medium_gray}}>
                            Private recipe
                        </H5>
                        <SubButton>
                            Shrimp
                        </SubButton>
                        <SubButton>
                            Chinese
                        </SubButton>
                    </View>
                    <H5 style={{color: colors.medium_gray}}>
                        {draft.data.recipeData.description}
                    </H5>
                    <View style={{flex: 1, gap: 20}}>
                        <RecipeNav selectedValue={selectedPage} onSelect={setSelectedPage}/>
                        <View style={{display: selectedPage === 0 ? 'flex' : 'none'}}>
                            {<OverviewEdit recipeObject={draft}/>}
                        </View>
                        <View style={{display: selectedPage === 1 ? 'flex' : 'none'}}>
                            {<IngredientsEdit recipeObject={draft} onAddIngredient={() => router.push('/(tabs)/(logs)/HandleCreateRecipe/AddIngredient')}/>}
                        </View>
                        <View style={{display: selectedPage === 2 ? 'flex' : 'none'}}>
                            {<DirectionsEdit recipeObject={draft}/>}
                        </View>
                    </View>
                </View>
                <PrimaryButton onPress={() => router.push('/(tabs)/(logs)/HandleCreateRecipe/PreviewRecipe')}>
                    Preview
                </PrimaryButton>
            </View>
            
        </KeyboardAware>
    )
}

export default createRecipe

const styles = StyleSheet.create({})