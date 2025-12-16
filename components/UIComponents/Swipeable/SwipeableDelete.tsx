import Bin from '@/assets/svg/bin.svg';
import { colors } from '@/theme';
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import SwipeableCore from './SwipeableCore';
type SwipeableCoreProps = {
    children: ReactNode;
    onPress: () => void;
};


const SwipeableDelete = ({ children, onPress}: Omit<SwipeableCoreProps, 'underChildren' | 'backgroundColor'>) => {
    return (
        <SwipeableCore 
            underChildren={
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Bin style={{color: colors.white}}/>
                </View>
            } 
            onPress={onPress} 
            backgroundColor={colors.error}
        >
            {children}
        </SwipeableCore>
    )
}

export default SwipeableDelete

const styles = StyleSheet.create({})