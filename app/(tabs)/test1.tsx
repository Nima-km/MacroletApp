import DropdownCore from '@/components/UIComponents/DropDown/DropDownCore'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const test1 = () => {
    const options = [
        { label: "JavaScript", value: "js" },
        { label: "Python", value: "py" },
        { label: "C++", value: "cpp" },
    ]
    return (
        <View>
            <DropdownCore options={options} />
            <DropdownCore options={options} extraButton={() => console.log('pressed boah')} extraButtonText='Add New'/>
        </View>
    )
}

export default test1

const styles = StyleSheet.create({})