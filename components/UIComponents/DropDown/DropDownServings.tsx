import { ServingSizeRaw } from '@/types/servingSize';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FormInputNumber } from '../TextInputs/FormInput';
import DropdownCore, { DropdownOption } from './DropDownCore';


interface DropdownSelectProps {
    options: ServingSizeRaw[];
    extraButtonText?: string;
    placeholder: string;
    servings: string
    setServings: (text: string) => void
    onSelect?: (option: DropdownOption) => void;
    extraButton?: (value: any) => void
}


const DropDownServings = ({
    options,
    servings,
    placeholder,
    setServings,
    onSelect,
    extraButton,
}: DropdownSelectProps) => {
    const processedOption = options.map((item) => {
        return {label: item.serving_type, value: item}
    })
    return (
        <View style={{flexDirection: 'row', gap: 8}}>
            <View style={{flex: 1}}>
                <FormInputNumber
                    onChangeText={setServings}
                    value={servings}
                />
            </View>
            <View style={{flex: 4}}>
                <DropdownCore options={processedOption} onSelect={onSelect} extraButton={extraButton} extraButtonText='Add New' placeholder={placeholder}/>
            </View>
            
        </View>
    )
}

export default DropDownServings

const styles = StyleSheet.create({})