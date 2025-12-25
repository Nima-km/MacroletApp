import { useCounterStore } from '@/store/useStore';
import React, { memo, ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SimpleChartCarbsSmall } from '../chartComponents/SimpleChart/SimpleChartSmall';
import { H1 } from '../UIComponents/Typography';


interface Props {
    progress?: number;
    goal?: number;
    footer?: ReactNode
    children?: ReactNode
}

const TestComponent = memo(({progress, goal, footer, children} : Props) => {
    //const points = useMemo(() => progress, []);
    const value = useCounterStore((state) => state.value);
    useEffect(() => {
        console.log('testcomponent got rerendered')
        return () => {
            console.log("testcomponent unmounted");
        };
    }, [])

    return (
        <View>
            <H1>hii</H1>
            <SimpleChartCarbsSmall target={140} progress={value} backgroundColor={'black'}/>
            {children}
        </View>
    )
},)

export default TestComponent

const styles = StyleSheet.create({})