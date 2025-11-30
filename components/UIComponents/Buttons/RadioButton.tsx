import { colors, typography } from '@/theme';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { H5_SemiBold } from '../Typography';

interface Option {
    label: string;
    value: number;
}

interface SelectionComponentProps {
    options: Option[];
    onSelect: (value: number) => void;
}

const StyledRadioButton = ({ options, onSelect }: SelectionComponentProps) => {
    const [selectedValue, setSelectedValue] = useState<number>(options[0].value);

    const handleSelect = (value: number) => {
        setSelectedValue(value);
        onSelect(value);
    };

    return (
        <View style={[styles.styled_container]}>
        {options.map((option) => (
        //    <View key={option.value} style={{ flex: 1 }}>
            <Pressable
                key={option.value}
                style={[
                    selectedValue === option.value ? styles.styled_selectedButton : styles.styled_notSelectedButton,

                    
                ]}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedValue === option.value }}
            >
                <H5_SemiBold style={[
                    styles.styled_optionText,
                    selectedValue === option.value && styles.styled_selectedButtonText,
                ]}>
                    {option.label}
                </H5_SemiBold>
            </Pressable>
        //  </View>
        ))}
        </View>
    );
};
export const DefaultRadioButton = ({ options, onSelect }: SelectionComponentProps) => {
    const [selectedValue, setSelectedValue] = useState<number>(options[0].value);

    const handleSelect = (value: number) => {
        setSelectedValue(value);
        onSelect(value);
    };

    return (
        <View style={[styles.container]}>
        {options.map((option) => (
        //    <View key={option.value} style={{ flex: 1 }}>
            <Pressable
                key={option.value}
                style={[
                   // styles.styled_notSelectedButton,

                    
                ]}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedValue === option.value }}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={[
                        styles.radio_button_inactive,
                        selectedValue === option.value && styles.radio_button_active
                    ]}>
                        {selectedValue === option.value &&
                            <View style={[styles.radio_button_inside]}/>
                        }
                    </View>
                    <View style={styles.text_container}>
                        <H5_SemiBold>
                            {option.label}
                        </H5_SemiBold>
                    </View>
                </View>
            </Pressable>
        //  </View>
        ))}
        </View>
    );
};

export default StyledRadioButton;




const styles = StyleSheet.create({
    container: {

    },
    text_container: {
        
        marginLeft: 6,
    },
    radio_button_inactive: {
        height: typography.h5_SemiBold.fontSize - 1,
        width: typography.h5_SemiBold.fontSize - 1,
        borderRadius: typography.h5_SemiBold.fontSize - 1,
        outlineWidth: 1,
        outlineColor: colors.inactive,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radio_button_inside: {
        height: typography.h5_SemiBold.fontSize - 4,
        width: typography.h5_SemiBold.fontSize - 4,
        borderRadius: typography.h5_SemiBold.fontSize - 4,
        backgroundColor: colors.primary
    },
    radio_button_active: {
        outlineColor: colors.primary,
    },
    styled_container: {
        flexDirection: 'row',
        backgroundColor: colors.primary_bg,
        borderRadius: 10,
        padding: 4,
    },
    styled_optionButton: {
        padding: 5,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    // backgroundColor: 'white',
    },
    styled_selectedButton: {
        padding: 9,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000000',
        
    },
    styled_notSelectedButton: {
        padding: 9,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        elevation: 2,
        shadowColor: colors.primary_bg,
        
    },
    styled_selectedButtonText: {
        color: colors.primary,
    },
    styled_shadowProp: {
        elevation: 5,
        shadowColor: '#000000',
    },
    styled_optionText: {
        color: colors.primary_inactive,
    },
})