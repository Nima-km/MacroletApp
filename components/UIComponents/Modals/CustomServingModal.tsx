import { colors } from '@/theme'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { PrimaryButton, SecondaryButton } from '../Buttons/Button'
import DropdownCore, { DropdownOption } from '../DropDown/DropDownCore'
import { FormInput, FormInputNumber } from '../TextInputs/FormInput'
import { H1 } from '../Typography'
import ModalCore from './ModalCore'




interface CustomServingProps {
    setNewServing: (servingName: string, servingMultiplyer: number) =>  void;
    onClose: () =>  void;
    
    options: DropdownOption[];
}

const CustomServingModal = ({setNewServing, onClose, options}: CustomServingProps) => {
    const [newServingName, setNewServingName] = useState('')
    const [newServingRatio, setNewServingRatio] = useState('0')
    const [selectedServing, setSelectedServing] = useState(options[0])
    
    function onSave() {
        console.log(selectedServing.value)
        const servingMultiplyer = Number(newServingRatio) * Number(selectedServing.value)
        setNewServing(newServingName, servingMultiplyer)
    }
    return (
        <ModalCore title='Custom Serving Size'>
            <View style={{flexDirection: 'column-reverse'}}>
                <View style={styles.buttonsContainer}>
                    <View style={{flex: 1,}}>
                        <SecondaryButton onPress={onClose}>
                            Cancel
                        </SecondaryButton>
                    </View>
                    <View style={{flex: 1,}}>
                        <PrimaryButton onPress={() => {onSave() , onClose()}}>
                            Confirm
                        </PrimaryButton>
                    </View>
                    
                </View>
                <View style={styles.mainContent}>
                    <View style={styles.rowContainer}>

                        <View style={styles.nameTextContainer}>
                            <FormInput
                                onChangeText={setNewServingName}
                                value={newServingName}
                                placeholder='Enter Name'
                            />
                        </View>
                        <H1 style={{color: colors.primary}}>=</H1>
                        <View style={styles.ratioTextContainer}>
                            <FormInputNumber
                                onChangeText={setNewServingRatio}
                                value={newServingRatio}
                            />
                        </View>
                        <View style={styles.referenceServingContainer}>
                            <DropdownCore options={options} placeholder={options[0].label} onSelect={setSelectedServing}/>
                        </View>

                    </View>
                </View>
            </View>
        </ModalCore>
    )
}

export default CustomServingModal

const styles = StyleSheet.create({
    mainContent: {
        marginVertical: 20,
        
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nameTextContainer: {
        height: 46,
        width: 115
    },
    ratioTextContainer: {
        height: 46,
        width: 50,
    },
    referenceServingContainer: {
        height: 46,
        flex: 1,
        position: "relative"
       //width: 134,
    },
})