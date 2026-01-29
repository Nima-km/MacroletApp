import { colors } from '@/theme';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { H5_SemiBold } from '../UIComponents/Typography';
interface Option {
    label: string;
    value: number;
}

interface SelectionComponentProps {
    selectedValue: number;
    onSelect: (value: number) => void;
}

const RecipeNav = ({ selectedValue, onSelect }: SelectionComponentProps) => {
    const options: Option[] = [
            { label: 'Overview', value: 0},
            { label: 'Ingredients', value: 1},
            { label: 'Directions', value: 2},
        ];
    //const [selectedValue, setSelectedValue] = useState<number | null>(options[0].value);
    
    const handleSelect = (value: number) => {
    //  setSelectedValue(value);
        onSelect(value);
    };

    return (
        <ScrollView>
            <View style={[styles.container]}>
            {options.map((option) => (
                <TouchableOpacity
                    activeOpacity={1}
                    key={option.value}
                    style={[
                        styles.optionButton,
                        selectedValue === option.value && styles.selectedButton,
                        
                    ]}
                    onPress={() => handleSelect(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedValue === option.value }}
                >
                <H5_SemiBold style={[ {color: selectedValue === option.value ? colors.black : colors.inactive, marginBottom: 10,} ]} >
                    {option.label}
                </H5_SemiBold>
                
                {selectedValue === option.value &&
                    <View style={[ {flexDirection: 'row', alignItems: 'center'}]}>
                    <View style={{backgroundColor: colors.error,
                        height: 3,
                        //marginTop: 10,
                        flex: 1,
                        }}/>
                    </View>
                }
                </TouchableOpacity>
            ))}
            </View>
        </ScrollView>
    );
}

export default RecipeNav

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        
        justifyContent: 'space-between',
        borderBottomWidth: 1, // ultra thin (1px on most screens)
        borderBottomColor: colors.light_gray,
    },
    optionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    selectedButton: {
        elevation: 1,
        shadowColor: '#000000',
    },
    shadowProp: {
        elevation: 5,
        shadowColor: '#000000',
    },
    optionText: {
        fontSize: 16,
        color: '#333333',
    },
});