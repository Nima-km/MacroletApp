

import { SimpleChartCarbsGoal, SimpleChartFatGoal, SimpleChartProteinGoal } from '@/components/chartComponents/SimpleChart/SimpleChartGoal'
import { SimpleChartCarbsMacro, SimpleChartFatMacro, SimpleChartProteinMacro } from '@/components/chartComponents/SimpleChart/SimpleChartMacro'
import { SimpleChartCarbsSmall, SimpleChartFatSmall, SimpleChartProteinSmall } from '@/components/chartComponents/SimpleChart/SimpleChartSmall'
import { InlineButton, PrimaryButton, SecondaryButton, SubButton } from '@/components/UIComponents/Buttons/Button'
import StyledRadioButton, { DefaultRadioButton } from '@/components/UIComponents/Buttons/RadioButton'
import ExpandableTextInput from '@/components/UIComponents/TextInputs/ExpandableTextInput'
import { FormInput, FormInputMacro, FormInputSearch } from '@/components/UIComponents/TextInputs/FormInput'
import { H1, H2, H3, H4, H4_Bold, H5, H5_SemiBold, H6 } from '@/components/UIComponents/Typography'
import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'


const test = () => {
    const AutoCalorie = [
        { label: 'Auto-calculate', value: 1 },
        { label: 'Manual', value: 0 },
        
    ];
    const [note, setNote] = useState("");
    const [chartval, setChartval] = useState(50);
    const [input, setInput] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [macroInput, setMacroInput] = useState("")
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0} // adjust if header is present
        >
            <ScrollView>
            
                <H1>H1</H1>
                <H2>H2</H2>
                <H3>H3</H3>
                <H4>H4</H4>
                <H4_Bold>Test4*</H4_Bold>
                <H5>H5</H5>
                <H5_SemiBold>H5_SemiBold*</H5_SemiBold>
                <H6>H6</H6>
                <PrimaryButton onPress={() => setChartval((prev) => prev + 10)}>
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
                    collapsedPlaceholder="Expandable Text Input"
                />
                <H3>charts</H3>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <SimpleChartProteinGoal target={150} progress={90} backgroundColor={'black'}/>
                    <SimpleChartCarbsGoal target={150} progress={90} backgroundColor={'black'}/>
                    <SimpleChartFatGoal target={150} progress={90} backgroundColor={'black'}/>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <SimpleChartProteinMacro target={150} progress={90} backgroundColor={'black'}/>
                    <SimpleChartCarbsMacro target={150} progress={90} backgroundColor={'black'}/>
                    <SimpleChartFatMacro target={150} progress={90} backgroundColor={'black'}/>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <SimpleChartProteinSmall target={150} progress={chartval} backgroundColor={'black'}/>
                    
                    <SimpleChartCarbsSmall target={150} progress={chartval} backgroundColor={'black'}/>
                    <SimpleChartFatSmall target={150} progress={chartval} backgroundColor={'black'}/>
                </View>
                <H3>Inputs</H3>
                <View style={{gap: 20}}>
                    
                    <FormInput value={input} onChangeText={setInput} placeholder='Empty Field'/>
                    <FormInputSearch value={searchInput} onChangeText={setSearchInput} />
                    <FormInput value={input} onChangeText={setInput} error={'Nickname already in use.'}/>
                    <View style= {{width: 70}}>
                        <FormInputMacro value={macroInput} onChangeText={setMacroInput} />
                    </View>
                </View>
                
                <View style={{padding: 20,}}/>
            
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default test

const styles = StyleSheet.create({})