import { Link } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const createRecipe = () => {
  return (
    <View>
        <Text>createRecipe</Text>
        <Link href={"/(tabs)/(logs)/handleCreateRecipe/overviewRecipe"} asChild>
            <TouchableOpacity>
                <Text>NAVIGATE to overviewRecipe</Text>
            </TouchableOpacity>
        </Link>
    </View>
  )
}

export default createRecipe

const styles = StyleSheet.create({})