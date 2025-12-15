import BarcodeComponent from '@/components/findFoodTabs/BarcodeComponent';
import QuickAddComponent from '@/components/findFoodTabs/QuickAddComponent';
import RecentComponent from '@/components/findFoodTabs/RecentComponent';
import RecipeComponent from '@/components/findFoodTabs/RecipeComponent';
import VoiceComponent from '@/components/findFoodTabs/VoiceComponent';
import { useGetFoodItemRecent } from '@/db/hooks/history/foodItemhistory';
import { FoodInsert } from '@/types/food';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NavSelector from '../navComponents/NavSelector';
import { FormInputSearch } from '../UIComponents/TextInputs/FormInput';
import { H5 } from '../UIComponents/Typography';

interface FindFoodProps {
    onFoodCardID: (id: number) => void
    onAddFood: (foodObject: FoodInsert) => void
}

const FindFood = ({onFoodCardID, onAddFood}: FindFoodProps) => {
    const [selectedPage, setSelectedPage] = useState(0);
    const [search, setSearch] = useState('');
    const { data: history, isLoading: loadingSectionList, error: errorSectionList } = useGetFoodItemRecent();
    const [filteredData, setFilteredData] = useState(history);
    const renderPage = useMemo(() => {
        switch (selectedPage) {
        case 0:
            return <RecentComponent filteredData={filteredData} onFoodCardID={onFoodCardID}/>;
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
    }, [selectedPage, filteredData])
    useEffect(() => {
        setFilteredData(history?.filter((item) => item.food.name.toLowerCase().includes(`${search}`.toLowerCase())).slice(0, 4))
        console.log('recent history', errorSectionList, loadingSectionList)
    }, [search, history])
    if (loadingSectionList) {
        return <H5>{loadingSectionList}</H5>
    }
    return (
        <View style={styles.container}>
            <FormInputSearch 
                value={search}
                onChangeText={setSearch}
            />
            <View style={{marginHorizontal: -20, marginVertical: 12}}>
                <NavSelector selectedValue={selectedPage} onSelect={(value) => setSelectedPage(value)}/>
            </View>
            <View style={{flex: 1}}>
                {renderPage}
            </View>
        </View>
    )
}

export default FindFood

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
    }
})