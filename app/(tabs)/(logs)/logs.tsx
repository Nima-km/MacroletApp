import { Link } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const logs = () => {
    return (
        <View>
            <Text>logs</Text>
            <Link href={"/(tabs)/(logs)/logFood"} asChild>
                <TouchableOpacity>
                <Text>NAVIGATE</Text>
                </TouchableOpacity>
            </Link>
        </View>
    )
}

export default logs

const styles = StyleSheet.create({})