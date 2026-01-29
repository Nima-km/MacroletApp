import { Link } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const RecipeComponent = () => {
  return (
    <View>
		<Text>RecipeComponent</Text>
		<Link href={"/(tabs)/(logs)/recipe"} asChild>
			<TouchableOpacity>
				<Text>NAVIGATE to recipe</Text>
			</TouchableOpacity>
		</Link>
		<Link href={"/(tabs)/(logs)/HandleCreateRecipe/createRecipeInfo"} asChild>
			<TouchableOpacity>
				<Text>NAVIGATE to create recipe</Text>
			</TouchableOpacity>
		</Link>
    </View>
  )
}

export default RecipeComponent

const styles = StyleSheet.create({})