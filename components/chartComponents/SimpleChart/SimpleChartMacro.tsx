import Carbs from '@/assets/svg/carbs.svg'
import Fat from '@/assets/svg/fat.svg'
import Protein from '@/assets/svg/protein.svg'
import { colors } from '@/theme'
import React from 'react'
import SimpleChartCore from './SimpleChartCore'
const width = 105
type SimpleChartProps = {
    target: number,
    progress: number,
    backgroundColor: string,
}

export const SimpleChartProteinMacro = ({target, progress, backgroundColor} : SimpleChartProps) => {
    return (
        <SimpleChartCore 
            target={target}
            progress={progress} 
            mode={false} 
            width={width} 
            topText={'PROTEIN'} 
            barColor={colors.protein} 
            backgroundColor={backgroundColor}
            Icon={Protein}
        />
    )
}

export const SimpleChartFatMacro = ({target, progress, backgroundColor} : SimpleChartProps) => {
    return (
        <SimpleChartCore 
            target={target}
            progress={progress} 
            mode={false} 
            width={width} 
            topText={'FAT'}
            barColor={colors.fat}
            backgroundColor={backgroundColor}
            Icon={Fat}
        />
    )
}


export const SimpleChartCarbsMacro = ({target, progress, backgroundColor} : SimpleChartProps) => {
    return (
        <SimpleChartCore 
            target={target}
            progress={progress} 
            mode={false} 
            width={width} 
            topText={'CARBS'}
            barColor={colors.carbs}
            backgroundColor={backgroundColor}
            Icon={Carbs}
        />
    )
}