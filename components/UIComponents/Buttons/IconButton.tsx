import { colors } from "@/theme";
import React, { PropsWithChildren, ReactNode } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

type ButtonProps = PropsWithChildren<TouchableOpacityProps> & {
    style?: any; // or StyleProp<ViewStyle>
    icon?: ReactNode; // or StyleProp<ViewStyle>
};

export function IconButton({ icon, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity
            {...props}
            style={[
                style,
                {
                    backgroundColor: colors.primary_bg,
                    justifyContent: "center",
                    alignItems: "center",
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                },
            ]}
        >
            {icon}
        </TouchableOpacity>
    );
}

export default IconButton;

const styles = StyleSheet.create({});
