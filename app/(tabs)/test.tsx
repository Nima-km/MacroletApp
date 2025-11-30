
import { InlineButton, PrimaryButton, SecondaryButton, SubButton } from '@/components/UIComponents/Buttons/Button'
import StyledRadioButton, { DefaultRadioButton } from '@/components/UIComponents/Buttons/RadioButton'
import ExpandableTextInput from '@/components/UIComponents/TextInputs/ExpandableTextInput'
import { H1, H2, H3, H4, H4_Bold, H5, H5_SemiBold, H6 } from '@/components/UIComponents/Typography'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

const test = () => {
    const AutoCalorie = [
        { label: 'Auto-calculate', value: 1 },
        { label: 'Manual', value: 0 },
        
    ];
    const [note, setNote] = useState("");
    return (
        <View>
            <H1>H1</H1>
            <H2>H2</H2>
            <H3>H3</H3>
            <H4>H4</H4>
            <H4_Bold>Test4*</H4_Bold>
            <H5>H5</H5>
            <H5_SemiBold>H5_SemiBold*</H5_SemiBold>
            <H6>H6</H6>
            <PrimaryButton>
                Primary Button
            </PrimaryButton>
            <SecondaryButton>
                Secondary Button
            </SecondaryButton>
            <InlineButton>
                Inline Button
            </InlineButton>
            <SubButton>
                + Add Nickname
            </SubButton>
            <View style = {{}}>
                <StyledRadioButton options={AutoCalorie} onSelect={(value) => console.log('SELECTED', value)}/>
            </View>

            <View style = {{}}>
                <DefaultRadioButton options={AutoCalorie} onSelect={(value) => console.log('SELECTED', value)}/>
            </View>
            <ExpandableTextInput 
                value={note}
                onChangeText={setNote}
                placeholder="Write your note..."
                collapsedPlaceholder="Expandable Text Input"/>
        </View>
    )
}

export default test

const styles = StyleSheet.create({})