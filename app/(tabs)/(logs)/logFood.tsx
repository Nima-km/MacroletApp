import FindFood from '@/components/findFoodComponents/FindFood';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const logFood = () => {
    return (
        <View>
            <Text>logFood</Text>
            <FindFood/>
        </View>
    )
}

export default logFood

const styles = StyleSheet.create({})