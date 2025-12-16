import { useSkiaFonts } from '@/context/FontProvider';
import { processNumber } from '@/helper/processNumber';
import { colors } from '@/theme';
import { Canvas, LinearGradient, Path, Skia, Text, vec } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";

const startColor="#EE5B5B"
const midColor="#FFA658"
const endColor="#FFE043"
const STROKE_WIDTH = 24;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ArcProgressProps {
  
    targetPercentage?: number;
    dailyProgress: number;
}


const ArcChart = ({targetPercentage, dailyProgress}: ArcProgressProps) => {
    const { h1, h2, h5 } = useSkiaFonts();
    const width = SCREEN_WIDTH - 40
    const height = 160
    const smaller_chart = 0
    const radius = Math.sqrt((width * width)/ 2) - STROKE_WIDTH / 2 - (8.25 / 80) * STROKE_WIDTH * 2 - smaller_chart
    if (!targetPercentage)
        targetPercentage = 1
    const percentageConsumed = useSharedValue(0);
    const percentageRemaining = useSharedValue(0);
    const outerRadius = radius + STROKE_WIDTH / 2
    const animateChart = () => {
        percentageConsumed.value = withTiming(dailyProgress, {
            duration: 1250,
            easing: Easing.inOut(Easing.cubic),
        });
        percentageRemaining.value = withTiming(targetPercentage - dailyProgress, {
            duration: 1250,
            easing: Easing.inOut(Easing.cubic),
        });
        //opacity.value = 0; 
        
    };
    const offset = (outerRadius - (Math.sqrt(((outerRadius) * (outerRadius)) * 2)) / 2) - (STROKE_WIDTH / 2) * (1 - Math.sqrt(2) / 2) - smaller_chart
    const angle_change = ((180 / (Math.PI * radius)) * STROKE_WIDTH)
    const consumedText = useDerivedValue(() => ((processNumber(percentageConsumed.value))).toString() + ' cal');
    const remainingText = useDerivedValue(() => processNumber(percentageRemaining.value).toString());
    const targetText = useDerivedValue(() => processNumber(targetPercentage).toString());
    const boundryRect = {
        x: 0,
        y: 0,
        width: radius * 2,
        height: radius * 2,
    };
    const path = Skia.Path.Make();
    path.addArc(boundryRect, 225 + angle_change, 90 - 2 * angle_change);
    const matrix = Skia.Matrix();
    matrix.translate(-offset + STROKE_WIDTH / 2, STROKE_WIDTH / 2);
    path.transform(matrix);
    const end = useDerivedValue(() => percentageConsumed.value / targetPercentage);
    const widthConsumed = useDerivedValue(() => width / 2 - (h1.measureText(consumedText.value).width ) / 2);
    const widthRemaining = useDerivedValue(() => (h5.measureText("Remaining").width / 2) - (h1.measureText(remainingText.value).width ) / 2);

    const widthTarget = useDerivedValue(() => width - (h2.measureText(targetText.value).width));
    const height1 = STROKE_WIDTH + 22
    const height2 = 120
    
    useEffect(() => {
        console.log("radius_change", angle_change)
        animateChart()
        //console.log(end.value)
    }, [dailyProgress])
    return (
        <Canvas style={{width: width, height: height, }}>
            <Path
                path={path}
                color={colors.off_white}
                style="stroke"
                strokeJoin="round"
                strokeWidth={STROKE_WIDTH}
                strokeCap="round"
                    
            />
            <Path
                path={path}
                style="stroke"
                strokeJoin="round"
                strokeWidth={STROKE_WIDTH}
                strokeCap="round"
                start={0}
                end={end}
            >
                <LinearGradient
                    start={vec(0, 0)}
                    end={vec(radius + 100, 0)}
                    colors={[startColor, midColor, endColor]}
                />
            </Path>
            <Text
                x={widthConsumed}
                y={height1 + h1.getSize()}
                text={consumedText}
                font={h1}
                
                color="black"
            />
            <Text
                x={width / 2 - (h5.measureText("Consumed").width ) / 2}
                y={height1 + h5.getSize() + h1.getSize() + 10}
                text={"Consumed"}
                font={h5}
                // opacity={opacity}
                color="black"
            />
            <Text
                x={widthRemaining}
                y={height2}
                text={remainingText}
                font={h2}
                //   opacity={opacity}
                color="black"
            />
            <Text
                x={0}
                y={height2 + h5.getSize() + 10}
                text={"Remaining"}
                font={h5}

                color="black"
            />
            <Text
                x={widthTarget}
                y={height2}
                text={targetText}
                font={h2}
                //opacity={opacity}
                color="black"
            />
            <Text
                x={width - (h5.measureText("Target").width)}
                y={height2 + h5.getSize() + 10}
                text={"Target"}
                font={h5}
                //   opacity={opacity}
                color="black"
            />
        </Canvas>
    )
}

export default ArcChart

const styles = StyleSheet.create({})