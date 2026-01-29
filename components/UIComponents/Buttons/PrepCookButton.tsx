import { colors } from '@/theme';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import ModalCore from '../Modals/ModalCore';
import { FormInputNumber } from '../TextInputs/FormInput';
import { H3, H4, H5 } from '../Typography';
import { PrimaryButton } from './Button';


interface PrepCookProps {
    
    prepTime: number;
    cookTime: number;
    setCookTime: (hour: string, mins: string) => void;
    setPrepTime: (hour: string, mins: string) => void;
    disable?: boolean;
}
interface PrepCookButtonProps {
    hour: string;
    mins: string;
    setMinute: (text: string) => void;
    setHour: (text: string) => void;
    onSave: (hour: string, mins: string) => void;
    onModal: () => void;
}

function calculateHour(hour: number, mins: number) {
    const totalMins = hour * 60 + mins

    return Math.floor(totalMins / 60)
}
function getHour(mins: number) {

    return Math.floor(mins / 60)
}
function getMinute(mins: number) {

    return (mins % 60)
}
function calculateMin(hour: number, mins: number) {
    const totalMins = hour * 60 + mins

    return (totalMins % 60)
}
function calculateTotalMin(hour: number, mins: number) {
    const totalMins = hour * 60 + mins

    return (totalMins)
}

const PrepCookButton = ({prepTime, cookTime, setCookTime, setPrepTime, disable = false}: PrepCookProps) => {

    const [cookModalVisible, setCookModalVisible] = useState(false)
    const [prepModalVisible, setPrepModalVisible] = useState(false)
    const [newPrepHour, setNewPrepHour] = useState(getHour(prepTime).toString())
    const [newPrepMinute, setNewPrepMinute] = useState(getMinute(prepTime).toString())
    const [newCookHour, setNewCookHour] = useState(getHour(cookTime).toString())
    const [newCookMinute, setNewCookMinute] = useState(getMinute(cookTime).toString())
    useEffect(() => {
        setNewPrepHour(getHour(prepTime).toString())
        setNewPrepMinute(getMinute(prepTime).toString())
    }, [prepTime])
    useEffect(() => {
        setNewCookHour(getHour(cookTime).toString())
        setNewCookMinute(getMinute(cookTime).toString())
    }, [cookTime])
    return (
        <View style={styles.container}>
            <Pressable style={styles.subSection} onPress={() => setPrepModalVisible(!prepModalVisible)} disabled={disable}>
                <H4>Prep</H4>
                <H5>
                    {getHour(prepTime) > 0 && (getHour(prepTime) + ' hr ')}
                    {getMinute(prepTime) > 0 && (getMinute(prepTime) + ' mins')}
                    {(getHour(prepTime) == 0 && getMinute(prepTime) == 0) && <H5 style={{color: colors.inactive}}>Enter Time</H5>}
                </H5>
                
            </Pressable>
            <View style={styles.line}/>
            <Pressable style={styles.subSection} onPress={() => setCookModalVisible(!prepModalVisible)} disabled={disable}>
                <H4>Cook</H4>
                <H5>
                    {getHour(cookTime) > 0 && (getHour(cookTime) + ' hr ')}
                    {getMinute(cookTime) > 0 && (getMinute(cookTime) + ' mins')}
                    {(getHour(cookTime) == 0 && getMinute(cookTime) == 0) && <H5 style={{color: colors.inactive}}>Enter Time</H5>}
                </H5>
                
            </Pressable>
            <View style={styles.line}/>
            <Pressable style={styles.subSection} disabled={disable}>
                <H4>Total</H4>
                <H5>
                    {calculateHour(getHour(prepTime) + getHour(cookTime), getMinute(prepTime) + getMinute(cookTime))> 0 && (calculateHour(getHour(prepTime) + getHour(cookTime), getMinute(prepTime) + getMinute(cookTime)) + ' hr ')}
                    {calculateMin(getHour(prepTime) + getHour(cookTime), getMinute(prepTime) + getMinute(cookTime)) > 0 && (calculateMin(getHour(prepTime) + getHour(cookTime), getMinute(prepTime) + getMinute(cookTime)) + ' mins')}
                    {(calculateTotalMin(getHour(prepTime) + getHour(cookTime), getMinute(prepTime) + getMinute(cookTime)) == 0 && getMinute(prepTime) == 0) && "—"}
                </H5>
                
            </Pressable>
            <Modal 
                visible={prepModalVisible}
                transparent
                animationType='fade'
                onRequestClose={() =>{
                    setPrepModalVisible(false)
                }}
            >
                <ModalCore title='Prep Time' >
                    <PrepCookSetter hour={newPrepHour} mins={newPrepMinute} setMinute={setNewPrepMinute} setHour={setNewPrepHour} onSave={setPrepTime} onModal={() => setPrepModalVisible(false)}/>
                </ModalCore>
            </Modal>
            <Modal 
                visible={cookModalVisible}
                transparent
                animationType='fade'
                onRequestClose={() =>{
                    setCookModalVisible(false)
                }}
            >
                <ModalCore title='Cook Time'>
                    <PrepCookSetter hour={newCookHour} mins={newCookMinute} setMinute={setNewCookMinute} setHour={setNewCookHour} onSave={setCookTime} onModal={() => setCookModalVisible(false)}/>
                </ModalCore>
            </Modal>
        </View>
    )
}


const PrepCookSetter = ({ hour, mins, setHour, setMinute, onSave, onModal}: PrepCookButtonProps) => {
  return (
    <View>
        <View style={styles.modalRowContainer}>
            <View style={styles.modalRowSubContainer}>
                <View style={styles.textContainer}>
                    <FormInputNumber value={hour} onChangeText={setHour}/>
                </View>
                <H3 style={{color: colors.primary}}>hours</H3>
            </View>
            <View style={styles.modalRowSubContainer}>
                <View style={styles.textContainer}>
                    <FormInputNumber value={mins} onChangeText={setMinute}/>
                </View>
                <H3 style={{color: colors.primary}}>mins</H3>
            </View>
        </View>
        <PrimaryButton onPress={() => {onSave(hour, mins), onModal()}}>
            Save
        </PrimaryButton>
    </View>
  )
}


export default PrepCookButton

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 80,
       // flex: 1,
       // width: 350,
        borderRadius: 8,
        backgroundColor: colors.light_gray,
        padding: 12,

    },
    subSection: {
        flex: 1,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    line: {
        height: '100%',
        backgroundColor: '#ccc',
        width: 1,
    },
    modalRowContainer: {
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    modalRowSubContainer: {
        flexDirection: 'row', 
        alignItems: 'center',
     //   justifyContent: 'space-evenly',
        gap: 10, 
        
     //   backgroundColor: 'blue'
    },
    textContainer: {
        height: 46,
        width: 70
    }
})