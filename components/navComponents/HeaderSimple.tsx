import React from 'react';
import { StyleSheet } from 'react-native';
import HeaderCore from './HeaderCore';

interface HeaderSimpleProps {
    title: string;
}

const HeaderSimple = ({title}: HeaderSimpleProps) => {

    return (
        <HeaderCore 
            title={title} 
        />
    )
}

export default HeaderSimple

const styles = StyleSheet.create({
    
})