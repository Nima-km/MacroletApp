import BarcodeComponent from '@/components/findFoodComponents/BarcodeComponent';
import QuickAddComponent from '@/components/findFoodComponents/QuickAddComponent';
import RecentComponent from '@/components/findFoodComponents/RecentComponent';
import RecipeComponent from '@/components/findFoodComponents/RecipeComponent';
import VoiceComponent from '@/components/findFoodComponents/VoiceComponent';
import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FindFood = () => {
    const [selectedPage, setSelectedPage] = useState(1);

    const renderPage = useMemo(() => {
        console.log('I ran')
        switch (selectedPage) {
        case 0:
            return <RecentComponent /*filteredData={filteredData}*//>;
        case 1:
            return <RecipeComponent/>;
        case 2:
            return <BarcodeComponent/>;
        case 3:
            return <VoiceComponent/>
        case 4:
            return <QuickAddComponent/>
        default:
            return null;
        }
    }, [selectedPage, /*filteredData*/])
    return (
        <View>
            <Text>findFood</Text>
            <Link href={"/(tabs)/(logs)/food"} asChild>
                <TouchableOpacity>
                    <Text>NAVIGATE to Food</Text>
                </TouchableOpacity>
            </Link>
            {renderPage}
        </View>
    )
}

export default FindFood

const styles = StyleSheet.create({})