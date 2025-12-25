import { colors } from '@/theme'
import React from 'react'
import SimpleChartCore from './SimpleChartCore'
const width = 78
type SimpleChartProps = {
    target: number,
    progress?: number,
    backgroundColor: string,
}

export const SimpleChartProteinSmall = ({target, progress, backgroundColor} : SimpleChartProps) => {
    return (
        <SimpleChartCore 
            target={target}
            progress={progress} 
            mode={false} 
            width={width} 
            topText={'PROTEIN'} 
            barColor={colors.protein} 
            backgroundColor={backgroundColor}
        />
    )
}

export const SimpleChartFatSmall = ({target, progress, backgroundColor} : SimpleChartProps) => {
    return (
        <SimpleChartCore 
            target={target}
            progress={progress} 
            mode={false} 
            width={width} 
            topText={'FAT'}
            barColor={colors.fat}
            backgroundColor={backgroundColor}
           
        />
    )
}


export const SimpleChartCarbsSmall = ({target, progress, backgroundColor} : SimpleChartProps) => {
    return (
        <SimpleChartCore 
            target={target}
            progress={progress} 
            mode={false} 
            width={width} 
            topText={'CARBS'}
            barColor={colors.carbs}
            backgroundColor={backgroundColor}
            
        />
    )
}