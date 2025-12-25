import { MacroType } from '@/types/food'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

const createRecipe = () => {
    const [recipeName, setRecipeName] = useState('')
    const [recipeDescription, setRecipeDescription] = useState('')
    const [recipeTags, setRecipeTags] = useState([''])
    const [totalMacros, setTotalMacros] = useState<MacroType>()

    return (
        <View style={{flex: 1}}>
            
        </View>
    )
}

export default createRecipe

const styles = StyleSheet.create({})