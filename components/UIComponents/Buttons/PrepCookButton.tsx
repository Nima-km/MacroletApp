import { colors } from '@/theme';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import ModalCore from '../Modals/ModalCore';
import { FormInputNumber } from '../TextInputs/FormInput';
import { H3, H4, H5 } from '../Typography';
import { PrimaryButton } from './Button';


interface PrepCookProps {
    prepHour: number;
    prepMinute: number;
    cookHour: number;
    cookMinute: number;
    setCookHourMinute: (hour: string, mins: string) => void;
    setPrepHourMinute: (hour: string, mins: string) => void;
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
function calculateMin(hour: number, mins: number) {
    const totalMins = hour * 60 + mins

    return (totalMins % 60)
}
function calculateTotalMin(hour: number, mins: number) {
    const totalMins = hour * 60 + mins

    return (totalMins)
}

const PrepCookButton = ({prepHour, prepMinute, cookHour, cookMinute, setCookHourMinute, setPrepHourMinute}: PrepCookProps) => {

    const [cookModalVisible, setCookModalVisible] = useState(false)
    const [prepModalVisible, setPrepModalVisible] = useState(false)
    const [newPrepHour, setNewPrepHour] = useState(prepHour.toString())
    const [newPrepMinute, setNewPrepMinute] = useState(prepMinute.toString())
    const [newCookHour, setNewCookHour] = useState(cookHour.toString())
    const [newCookMinute, setNewCookMinute] = useState(cookMinute.toString())

    return (
        <View style={styles.container}>
            <Pressable style={styles.subSection} onPress={() => setPrepModalVisible(!prepModalVisible)}>
                <H4>Prep</H4>
                <H5>
                    {prepHour > 0 && (prepHour + ' hr ')}
                    {prepMinute > 0 && (prepMinute + ' mins')}
                    {(prepHour == 0 && prepMinute == 0) && <H5 style={{color: colors.inactive}}>Enter Time</H5>}
                </H5>
                
            </Pressable>
            <View style={styles.line}/>
            <Pressable style={styles.subSection} onPress={() => setCookModalVisible(!prepModalVisible)}>
                <H4>Cook</H4>
                <H5>
                    {cookHour > 0 && (cookHour + ' hr ')}
                    {cookMinute > 0 && (cookMinute + ' mins')}
                    {(cookHour == 0 && cookMinute == 0) && <H5 style={{color: colors.inactive}}>Enter Time</H5>}
                </H5>
                
            </Pressable>
            <View style={styles.line}/>
            <Pressable style={styles.subSection}>
                <H4>Total</H4>
                <H5>
                    {calculateHour(prepHour + cookHour, prepMinute + cookMinute)> 0 && (calculateHour(prepHour + cookHour, prepMinute + cookMinute) + ' hr ')}
                    {calculateMin(prepHour + cookHour, prepMinute + cookMinute) > 0 && (calculateMin(prepHour + cookHour, prepMinute + cookMinute) + ' mins')}
                    {(calculateTotalMin(prepHour + cookHour, prepMinute + cookMinute) == 0 && prepMinute == 0) && "—"}
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
                    <PrepCookSetter hour={newPrepHour} mins={newPrepMinute} setMinute={setNewPrepMinute} setHour={setNewPrepHour} onSave={setPrepHourMinute} onModal={() => setPrepModalVisible(false)}/>
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
                    <PrepCookSetter hour={newCookHour} mins={newCookMinute} setMinute={setNewCookMinute} setHour={setNewCookHour} onSave={setCookHourMinute} onModal={() => setCookModalVisible(false)}/>
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
        width: 350,
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