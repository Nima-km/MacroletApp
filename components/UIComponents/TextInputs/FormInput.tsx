import SearchIcon from '@/assets/svg/search.svg';
import { colors, typography } from "@/theme";
import React, { FC, useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextStyle, View } from "react-native";
import { SvgProps } from "react-native-svg";
import { H6 } from "../Typography";
const iconWidth = 24
interface FormInputProps {
    label?: string;
    value: string;
    style?: TextStyle | TextStyle[];
    onChangeText: (text: string) => void;
    placeholder?: string;
    unit?: string;
    selectTextOnFocus? : boolean;
    error?: string | null;
    secureTextEntry?: boolean;
    Icon?: FC<SvgProps>;
    numeric?: boolean;
    upperLimit?: number;
    lowerLimit?: number;
    center?: boolean;
}

export function FormInput({
    label,
    value,
    onChangeText,
    placeholder,
    style,
    error,
    secureTextEntry,
    selectTextOnFocus = false,
    Icon,
    numeric,
    unit,
    center,
    upperLimit,
    lowerLimit,
}: FormInputProps) {
    const hasError = Boolean(error);
    const inputRef = useRef<TextInput>(null);
    return (
        <Pressable onPress={() => {inputRef.current?.focus()}}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.inputContainer, hasError && styles.inputError, center && styles.centerText]}>
            {Icon && <Icon width={iconWidth} height={iconWidth} style={{marginLeft: 0, marginRight: 8}} />}
            <View style={[styles.input, !center && {flex: 1}]}>
                <TextInput
                    value={value}
                    ref={inputRef}
                    selectTextOnFocus = {selectTextOnFocus}
                    onChangeText={(text) =>{
                        if (numeric) {
                            text = text
                                .replace(/[^0-9.]/g, "")   // allow digits and dots
                                .replace(/(\..*)\./g, "$1"); // keep only the first dot
                            if (upperLimit != undefined)
                                text = (Number(text) > upperLimit ? upperLimit : text).toString()
                            if (lowerLimit != undefined)
                                text = (Number(text) < lowerLimit ? lowerLimit : text).toString()
                            
                        }
                        onChangeText(text);
                    }}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    style={[
                        {padding: 0},
                        typography.h5,
                        style,
                        // apply red border when error exists
                    ]}
                    placeholderTextColor="#999"
                   /* onBlur={() => {
                        onChangeText(value.padStart(2, "0"))
                    }}*/
                />
                
            </View>
            {unit && <Text style={[{marginLeft: 2}, style]}>{unit}</Text>}
        </View>
        {hasError && <H6 style={styles.errorText}>{error}</H6>}
        </Pressable>
    );
}

export function FormInputSearch({
    value,
    onChangeText,
    placeholder,
    error,
}: FormInputProps) {
    return (
        <FormInput value={value} onChangeText={onChangeText} Icon={SearchIcon} placeholder={placeholder} error={error}/>
    )
}
export function FormInputMacro({
    value,
    onChangeText,
    error,
    style,
}: FormInputProps) {
    return (
        <FormInput value={value} onChangeText={onChangeText} numeric center placeholder={'0'} error={error} unit='g' style={style} selectTextOnFocus/>
    )
}
export function FormInputNumber({
    value,
    style,
    upperLimit,
    lowerLimit,
    onChangeText,
}: FormInputProps) {

    return (
        <FormInput value={value} onChangeText={onChangeText} numeric center placeholder={'0'} style={style ?? typography.h3} upperLimit= {upperLimit} lowerLimit={lowerLimit} selectTextOnFocus/>
    )
}
const styles = StyleSheet.create({
    inputContainer: {
       flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        paddingTop: 14,
        paddingBottom: 14,
    },
    label: {
        marginBottom: 6,
        color: "#ddd",
        fontSize: 14,
    },
    input: {
     //   flex: 1,
        minWidth: 1,
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    inputError: {
        borderWidth: 1,
        borderColor: colors.error,
    },
    errorText: {
        marginTop: 1,
        color: colors.error,
    },
    centerText: {justifyContent: 'center', alignItems: 'center'}
});