import BarcodeComponent from '@/components/findFoodTabs/BarcodeComponent';
import QuickAddComponent from '@/components/findFoodTabs/QuickAddComponent';
import RecentComponent from '@/components/findFoodTabs/RecentComponent';
import RecipeComponent from '@/components/findFoodTabs/RecipeComponent';
import VoiceComponent from '@/components/findFoodTabs/VoiceComponent';
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