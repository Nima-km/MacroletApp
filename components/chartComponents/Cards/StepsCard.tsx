import { H4, H5 } from '@/components/UIComponents/Typography'
import { colors } from '@/theme'
import { DirectionStep } from '@/types/recipe'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface Props {
    item: DirectionStep
    index: number;

}

const StepsCard = ({item, index}: Props) => {
    return (
        <View style={{borderRadius: 8, padding: 12, gap: 12, backgroundColor: colors.white}}>
            <H4 style={{color: colors.primary}}>Step {index + 1}</H4>
            <H5 style={{flexWrap: 'wrap'}}>{item.text}</H5>
        </View>
    )
}

export default StepsCard

const styles = StyleSheet.create({})