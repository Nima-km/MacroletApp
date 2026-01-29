import { colors } from '@/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import KeyboardAware from '../KeyboardAware/KeyboardAware';
import { H3 } from '../Typography';


interface ModalProps {
    title: string;
    children: React.ReactNode;
}

const ModalCore = ({ children, title }: ModalProps) => {
    return (
        <KeyboardAware scrollEnabled={false}>
            <View style={styles.container}>
                <View style={styles.subContainer}>
                    <H3>{title}</H3>
                    {children}
                </View>
            </View>
        </KeyboardAware>
    )
}

export default ModalCore

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    subContainer: {
        backgroundColor: colors.off_white,
        borderRadius: 8,
        padding: 16,
        margin: 20,
        flex: 1,
    }
})