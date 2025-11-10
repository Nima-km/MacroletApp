import Directions from '@/components/recipeComponents/Directions';
import Ingredients from '@/components/recipeComponents/Ingredients';
import Overview from '@/components/recipeComponents/Overview';
import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const overviewRecipe = () => {
    const [selectedPage, setSelectedPage] = useState(0);

    const renderPage = useMemo(() => {
        console.log('I ran')
        switch (selectedPage) {
        case 0:
            return <Overview/>
        case 1:
            return <Ingredients/>
        case 2:
            return <Directions/>
        default:
            return null;
        }
    }, [selectedPage, /*filteredData*/])
    return (
        <View>
            <Text>overviewRecipe</Text>
            <Link href={"/(tabs)/(logs)/handleCreateRecipe/addIngredient"} asChild>
                <TouchableOpacity>
                    <Text>NAVIGATE to addIngredient</Text>
                </TouchableOpacity>
            </Link>
            {renderPage}
        </View>
    )
}

export default overviewRecipe

const styles = StyleSheet.create({})