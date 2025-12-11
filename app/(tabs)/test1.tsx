import { PrimaryButton } from '@/components/UIComponents/Buttons/Button'
import PrepCookButton from '@/components/UIComponents/Buttons/PrepCookButton'
import DropdownCore from '@/components/UIComponents/DropDown/DropDownCore'
import CustomServingModal from '@/components/UIComponents/Modals/CustomServingModal'
import IngredientModal from '@/components/UIComponents/Modals/IngredientModal'
import QuickAddIngredientModal from '@/components/UIComponents/Modals/QuickAddIngredientModal'
import TextModal from '@/components/UIComponents/Modals/TextModal'
import { TestFood1, TestIngredientItem1 } from '@/tests/testData'
import React, { useState } from 'react'
import { Modal, StyleSheet, View } from 'react-native'

const test1 = () => {
    const options = [
        { label: "JavaScript", value: "js" },
        { label: "Python", value: "py" },
        { label: "C++", value: "cpp" },
    ]
    const servingOptions = [
        { label: "Grams", value: 0.01 },
        { label: "Sevings", value: 1 },
        { label: "lbs", value: 2 },
        { label: "Cups", value: 3 },
    ]
    const [prepHour, setPrepHour] = useState(0)
    const [prepMinute, setPrepMinute] = useState(45)
    const [cookHour, setCookHour] = useState(0)
    const [cookMinute, setCookMinute] = useState(35)
    const [customServingModalVisible, setCustomServingModalVisible] = useState(false)
    const [textModalVisible, setTextModalVisible] = useState(false)
    const [addIngredientModalVisible, setAddIngredientModalVisible] = useState(false)
    const [IngredientModalVisible, setIngredientModalVisible] = useState(false)
    function setCookHourMinute (hour: string, mins: string) {
        setCookHour(Number(hour))
        setCookMinute(Number(mins))
    }
    function setPrepHourMinute (hour: string, mins: string) {
        setPrepHour(Number(hour))
        setPrepMinute(Number(mins))
    }
    return (
        <View>
            <DropdownCore options={options} />
            <DropdownCore options={options} extraButton={() => console.log('pressed boah')} extraButtonText='Add New'/>
            <PrepCookButton prepHour={prepHour} cookHour={cookHour} prepMinute={prepMinute} cookMinute={cookMinute} setCookHourMinute={setCookHourMinute} setPrepHourMinute={setPrepHourMinute}/>
            <PrimaryButton onPress={() => setCustomServingModalVisible(true)}>
                open customServingModal
            </PrimaryButton>
            <PrimaryButton onPress={() => setTextModalVisible(true)}>
                open setTextModalVisible
            </PrimaryButton>
            <PrimaryButton onPress={() => setAddIngredientModalVisible(true)}>
                open setAddIngredientModalVisible
            </PrimaryButton>
            <PrimaryButton onPress={() => setIngredientModalVisible(true)}>
                open setIngredientModalVisible
            </PrimaryButton>
            <Modal
                visible={textModalVisible}
                transparent
                animationType='fade'
                onRequestClose={() =>{
                    setTextModalVisible(false)
                }}
            >
                <TextModal 
                    setText={(servingName) => console.log('text is ', servingName)}
                    onClose={() => setTextModalVisible(false)}
                    error='err'
                />
            </Modal>
            <Modal
                visible={customServingModalVisible}
                transparent
                animationType='fade'
                onRequestClose={() =>{
                    setCustomServingModalVisible(false)
                }}
            >
                <CustomServingModal 
                    options={servingOptions} 
                    setNewServing={(servingName, servingMultiplyer) => console.log('new serving is', servingName, servingMultiplyer)} 
                    onClose={() => setCustomServingModalVisible(false)}
                />
            </Modal>
            <Modal
                visible={addIngredientModalVisible}
                transparent
               // animationType='fade'
                onRequestClose={() =>{
                    setAddIngredientModalVisible(false)
                }}
            >
                <QuickAddIngredientModal
                    foodData={TestFood1}
                    options={servingOptions}
                    onClose={() => setAddIngredientModalVisible(false)} 
                    setIngredient={(ingredientDetails) => console.log("servingSize is", ingredientDetails)}
                />
            </Modal>
            <Modal
                visible={IngredientModalVisible}
                transparent
               // animationType='fade'
                onRequestClose={() =>{
                    setIngredientModalVisible(false)
                }}
            >
                <IngredientModal
                    foodData={TestFood1}
                    options={servingOptions}
                    onClose={() => setIngredientModalVisible(false)}
                    onDelete={() => console.log("DELETE")}
                    onSwap={() => console.log("SWAP")}
                    setIngredient={(ingredientDetails) => console.log("servingSize is", ingredientDetails)} 
                    ingredientData={TestIngredientItem1} 
                    selectedOption={0}          
                    />
            </Modal>
        </View>
    )
}

export default test1

const styles = StyleSheet.create({})