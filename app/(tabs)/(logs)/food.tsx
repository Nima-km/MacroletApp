import HeaderSimple from '@/components/navComponents/HeaderSimple'
import FoodInfoCore from '@/components/UIComponents/Modals/FoodInfo/FoodInfoCore'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const food = () => {
    return (
        <View style={{flex: 1}}>
            <HeaderSimple title={'View Meal'}/>
            <FoodInfoCore 
                primaryText={'Update'} primaryButton={(food, foodItem) => console.log('primary got pressed', food, foodItem)}
                secondaryText={'Log New'} secondaryButton={(food, foodItem) => console.log('sedondary got pressed')}
            />
        </View>
    )
}

export default food

const styles = StyleSheet.create({})