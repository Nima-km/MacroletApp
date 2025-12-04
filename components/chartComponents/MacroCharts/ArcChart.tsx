import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const startColor='';
const midColor='';
const endColor='';
const { width, height } = Dimensions.get('window');
interface ArcProgressProps {
  
  radius: number;
  
  targetPercentage: number;
  dailyProgress: number;
}



const ArcChart = () => {
    return (
        <View>
            <Text>ArcChart</Text>
        </View>
    )
}

export default ArcChart

const styles = StyleSheet.create({})