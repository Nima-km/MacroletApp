import { FormInputMacro } from "@/components/UIComponents/TextInputs/FormInput";
import { H4 } from "@/components/UIComponents/Typography";
import { useSkiaFonts } from "@/context/FontProvider";
import { typography } from "@/theme";
import {
    Canvas,
    RoundedRect,
    Text as SKText,
} from "@shopify/react-native-skia";
import React, { FC, useEffect, useState } from "react";
import { AppState, Dimensions, StyleSheet, View } from "react-native";
import {
    Easing,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { SvgProps } from "react-native-svg";

const { width: swidth, height } = Dimensions.get("window");
const strokeWidth = 16;
const margin = 2;
const iconWidth = 25;
type SimpleChartProps = {
    target?: number;
    progress?: number;
    edit?: boolean;
    mode: boolean;
    width: number;
    topText: string;
    barColor: string;
    backgroundColor: string;
    Icon?: FC<SvgProps>;
    value?: string;
    onChangeText?: (text: string) => void;
};

const SimpleChartCore = ({
    target,
    progress,
    barColor,
    backgroundColor,
    width,
    mode,
    edit = false,
    Icon,
    topText,
    value,
    onChangeText,
}: SimpleChartProps) => {
    const { h5 } = useSkiaFonts();
    const animatedBar = useSharedValue(0);
    const [appState, setAppState] = useState(AppState.currentState);
    const editMode = edit && value != undefined && onChangeText != undefined;
    if (!target) {
        target = 1;
    }
    if (!progress) {
        progress = 0;
    }
    const animateChart = () => {
        animatedBar.value = withTiming(progress, {
            duration: 1250,
            easing: Easing.inOut(Easing.cubic),
        });
    };
    useEffect(() => {
        animateChart();
    }, [target, progress]);
    const end = useDerivedValue(() =>
        target
            ? Math.min(
                  (Math.sqrt(animatedBar.value) / Math.sqrt(target)) *
                      (width - 2 * margin),
                  width - 2 * margin,
              )
            : 0,
    );
    const goalText = useDerivedValue(
        () =>
            Math.round(animatedBar.value).toString() +
            (mode ? "/" + target.toString() : "") +
            " g",
    );
    const widthGoal = useDerivedValue(
        () => (width - h5.measureText(goalText.value).width) / 2,
    );
    useEffect(() => {
        // console.log('SimpleChartCore got rerednered')
        const subscription = AppState.addEventListener(
            "change",
            (nextAppState) => {
                //console.log('App State changed to', nextAppState);
                setAppState(nextAppState);
                if (nextAppState === "active") {
                    animatedBar.value = progress - 0.01;
                    animateChart();
                } else if (nextAppState === "background") {
                    // The app is in the background, save state or pause tasks
                }
            },
        );
        return () => {
            subscription.remove();
        };
    }, []);
    useEffect(() => {
        animatedBar.value = progress - 0.01;
        animateChart();
    }, []);

    return (
        <View style={{ alignSelf: "flex-start", alignItems: "center" }}>
            <View
                style={{
                    flexDirection: "row",
                    marginBottom: 4,
                    justifyContent: "center",
                }}
            >
                <H4>{topText}</H4>
                {Icon && (
                    <Icon
                        width={iconWidth}
                        height={iconWidth}
                        style={{ marginLeft: 2 }}
                        pointerEvents="none"
                    />
                )}
            </View>
            {editMode ? (
                <View style={{ width: width, height: 50 }}>
                    <FormInputMacro
                        value={value}
                        onChangeText={onChangeText}
                        style={typography.h3}
                    />
                </View>
            ) : (
                <Canvas style={{ width: width, height: 35 }}>
                    <RoundedRect
                        x={0}
                        y={0}
                        width={width}
                        height={strokeWidth}
                        r={20}
                        color={backgroundColor}
                    />
                    <RoundedRect
                        x={2}
                        y={2}
                        width={end}
                        height={strokeWidth - 2 * margin}
                        r={20}
                        color={barColor}
                    />
                    <SKText
                        x={widthGoal}
                        y={strokeWidth + h5.getSize()}
                        font={h5}
                        text={goalText}
                    />
                </Canvas>
            )}
        </View>
    );
};

export default SimpleChartCore;

const styles = StyleSheet.create({});
