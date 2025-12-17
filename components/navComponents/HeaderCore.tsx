import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';
import { H1 } from '../UIComponents/Typography';



type Props = {
    title: string | undefined;

    LeftButton?: ReactNode;
    RightButton?: ReactNode;
};
function HeaderCore({ title, LeftButton, RightButton }: Props) {
    return (
        <SafeAreaView style={[styles.container, {paddingHorizontal: 25}]} edges={['top', 'right', 'left']}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.backButton}>
                    {LeftButton}
                </View>
                <View style={[{flex: 1, alignItems: 'center', justifyContent: 'center'}]}>
                    <H1>{title}</H1>
                </View>
                <View style={styles.backButton}>      
                    {RightButton}
                </View>
            </View>
        </SafeAreaView>
    );
}
export default HeaderCore

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: colors.white,
        alignItems: 'center',
        
    },
    backButton: {
        width: 40,
    },
});