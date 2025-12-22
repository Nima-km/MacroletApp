import { ServingSizeType } from '@/types/servingSize';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FormInputNumber } from '../TextInputs/FormInput';
import DropdownCore, { DropdownOption } from './DropDownCore';


interface DropdownSelectProps {
    options: Omit<ServingSizeType, 'food_id'>[];
    extraButtonText?: string;
    placeholder: string;
    servings: number
    setServings: (inp: number) => void
    onSelect?: (option: Omit<ServingSizeType, 'food_id'>) => void;
    extraButton?: (value: any) => void
}


const DropDownServings = ({
    options,
    servings,
    placeholder,
    setServings,
    onSelect = (option: Omit<ServingSizeType, 'food_id'>) => {},
    extraButton,
}: DropdownSelectProps) => {
    const processedOption = options.map((item) => {
        return {label: item.serving_type, value: item}
    })
    const [text, setText] = useState(servings.toString())
    function onSelectProcessed(value: DropdownOption) {
        onSelect(value.value)
    }
    return (
        <View style={{flexDirection: 'row', gap: 8}}>
            <View style={{flex: 1, height: 50}}>
                <FormInputNumber
                    onChangeText={(inp) => {setServings(Number(inp)), setText(inp)}}
                    value={text}
                />
            </View>
            <View style={{flex: 4, height: 50}}>
                <DropdownCore options={processedOption} onSelect={onSelectProcessed} extraButton={extraButton} extraButtonText='Add New' placeholder={placeholder}/>
            </View>
            
        </View>
    )
}

export default DropDownServings

const styles = StyleSheet.create({})