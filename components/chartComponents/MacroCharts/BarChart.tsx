import { useSkiaFonts } from '@/context/FontProvider';
import { processNumber } from '@/helper/processNumber';
import { colors } from '@/theme';
import { MacroType } from '@/types/food';
import { Canvas, DiffRect, RoundedRect, Text } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
interface BarChartProps {
    goal?: MacroType & Required<Pick<MacroType, "calories">>;
    progress?: MacroType & Required<Pick<MacroType, "calories">>;
}

const BarChart = ({goal, progress}: BarChartProps) => {
    const { h1, h5 } = useSkiaFonts();
    const width = SCREEN_WIDTH - 40
    const height = 84
    const strokeWidth = 40
    const r = 5
	if (!goal)
        goal = {protein: 0, fat: 0, carbs: 0, fiber: 0, calories: 0}
    if (!progress)
        progress = {protein: 0, fat: 0, carbs: 0, fiber: 0, calories: 0}
    const progressDaily = useSharedValue({
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        calories: 0,
    });
    const animateChart = () => {
    // Reset daily progress
       // progressDaily.value = { protein: 0, fat: 0, carbs: 0, fiber: 0, calories: 0 };
        // Update carbs immutably
        progressDaily.value = withTiming(progress,  {
        duration: 1250,
        easing: Easing.inOut(Easing.cubic),
        });
    };
    const makeRrct = (x: number, y: number, width: number, height: number,  rtl: number, rbl: number, rtr: number, rbr: number) => {
        'worklet';
        const rrct = {
        rect: { x: x, y: y, width, height },
        topLeft: { x: rtl, y: rtl },
        topRight: { x: rtr, y: rtr },
        bottomRight: { x: rbr, y: rbr },
        bottomLeft: { x: rbl, y: rbl },
        };
        return rrct
    }
    const endProtein = useDerivedValue(() => Math.min(((progressDaily.value.protein / Math.max(goal.calories, progress.calories)) * width * 4 ), width));
    const endCarb = useDerivedValue(() => Math.min(goal.calories ? (progressDaily.value.carbs / Math.max(goal.calories, progress.calories)) * width * 4 + endProtein.value: 0, width));
    const endFat = useDerivedValue(() => Math.min(goal.calories ? (progressDaily.value.fat / Math.max(goal.calories, progress.calories)) * width * 9 + endCarb.value : 0, width));
    const calorieDayText = useDerivedValue(() => (processNumber(progressDaily.value.calories) + ' / ' + processNumber(goal.calories) + ' cal'));
    const caloriesRemaining = useDerivedValue(() => (goal.calories ? processNumber(goal.calories - progressDaily.value.calories) : '0') + ' remaining')
    const chartHeight = 40
    const remainWidth = useDerivedValue(() => (width * 0.8) - ((h5?.measureText(caloriesRemaining.value) ? h5?.measureText(caloriesRemaining.value).width : 0) - 10) / 2);
    const fatBar = useDerivedValue(() => {
        return makeRrct(0, chartHeight, endFat.value, strokeWidth, r, r, 0, 0)
    })
    const carbBar = useDerivedValue(() => {
        return makeRrct(0, chartHeight, endCarb.value, strokeWidth, r, r, 0, 0)
    })
    const proteinBar = useDerivedValue(() => {
        return makeRrct(0, chartHeight, endProtein.value, strokeWidth, r, r, 0, 0)
    })
    const backgroundBar = makeRrct(0, chartHeight, width, strokeWidth, r, r, r, r)
    const MaskBar = makeRrct(0, chartHeight - 5, width, strokeWidth + 10, r, r, 5, 5)
    useEffect(() => {
        console.log(goal)
        animateChart()
    }, [goal])
    return (
        <Canvas style={{width: width, height: height}}>
            <Text 
                x={0}
                y={20} 
                text={calorieDayText} 
                font={h1}                
            />
            <RoundedRect
                rect={backgroundBar}
                color={colors.off_white}
            />
            
            <RoundedRect
                rect={fatBar}
                color={colors.fat}
            />
            <RoundedRect
                rect={carbBar}
                color={colors.carbs}
            />
            <RoundedRect
                rect={proteinBar}
                color={colors.protein}
            />
            <Text
              x={remainWidth}
              y={chartHeight + 25}
              font={h5}
              text={caloriesRemaining}
            />
            <DiffRect inner={backgroundBar} outer={MaskBar} color={colors.white}/>
        </Canvas>
    )
}

export default BarChart

const styles = StyleSheet.create({

})