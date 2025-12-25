

import { SimpleChartCarbsSmall, SimpleChartFatSmall, SimpleChartProteinSmall } from '@/components/chartComponents/SimpleChart/SimpleChartSmall'
import HeaderSimple from '@/components/navComponents/HeaderSimple'
import TestComponent from '@/components/testComponents/TestComponent'
import { PrimaryButton, SecondaryButton } from '@/components/UIComponents/Buttons/Button'
import { H1, H3, H4 } from '@/components/UIComponents/Typography'
import { colors } from '@/theme'
import React, { useCallback, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'


const test2 = () => {
    const AutoCalorie = [
        { label: 'Auto-calculate', value: 1 },
        { label: 'Manual', value: 0 },
        
    ];
    const [note, setNote] = useState("");
    const [chartval, setChartval] = useState(50);
    const [input, setInput] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [macroInput, setMacroInput] = useState("")
    const renderChart = useCallback(() => {
        return (<View style={{backgroundColor: colors.off_white, padding: 16, gap: 20, height: 180}}>
                            <H3>Nutrition Details</H3>
                        
                            <View style={[{marginBottom: 20}]}>
                                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                    <H1>
                                        {Math.floor(1500)}
                                    </H1>
                                    <H4>
                                        Calories
                                    </H4>
                                </View>
                                <View style={{}}>
                                    <SimpleChartProteinSmall target={150} progress={chartval} backgroundColor={colors.white} />
                                    <SimpleChartCarbsSmall target={150} progress={chartval} backgroundColor={colors.white} />
                                    <SimpleChartFatSmall target={150} progress={chartval} backgroundColor={colors.white} />
                                </View>
                            </View>
                        </View>)
    }, [chartval])
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={100} // adjust if header is present
        >
            <ScrollView style={{}}>
                <HeaderSimple title='DEEZ'/>
                <PrimaryButton onPress={() => setChartval((prev) => prev + 10)}>
                    Primary Button
                </PrimaryButton>
                <SecondaryButton onPress={() => setChartval((prev) => prev - 10)}>
                    Secondary Button
                </SecondaryButton>
                
                <H3>charts</H3>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <SimpleChartProteinSmall target={150} progress={chartval} backgroundColor={'black'}/>
                    
                    <SimpleChartCarbsSmall target={150} progress={chartval} backgroundColor={'black'}/>
                    <SimpleChartFatSmall target={150} progress={chartval} backgroundColor={'black'}/>
                </View>
                <H3>Test charts</H3>
                {renderChart()}
                <TestComponent footer={renderChart()}>
                    
                </TestComponent>
                <View style={{padding: 20,}}/>
            
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default test2

const styles = StyleSheet.create({})