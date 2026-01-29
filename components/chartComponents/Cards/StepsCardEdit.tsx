import CameraIcon from '@/assets/svg/camera.svg'
import ExpandableTextInput from '@/components/UIComponents/TextInputs/ExpandableTextInput'
import { H4 } from '@/components/UIComponents/Typography'
import { DirectionStep } from '@/types/recipe'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

interface Props {
    item: DirectionStep
    index: number;
    onChangeText: (text: string) => void
    onDelete: () => void
}

const StepsCardEdit = ({item, index, onChangeText, onDelete}: Props) => {
    return (
        <ExpandableTextInput value={item.text} onChangeText={onChangeText} collapsedPlaceholder={'Step ' + (index + 1).toString() } expandedHeight={120} placeholder='Start typing your directions.'>
            <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 28}}>
                <Pressable style={{flexDirection: 'row', gap: 8}}>
                    <CameraIcon/>
                    <H4>
                        Add Photo
                    </H4>
                </Pressable>
            </View>
        </ExpandableTextInput>
    )
}

export default StepsCardEdit

const styles = StyleSheet.create({})