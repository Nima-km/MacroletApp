import { colors } from "@/theme";
import { PropsWithChildren, ReactNode } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from "react-native";
import { H2, H3, H4, H5 } from "../Typography";

type ButtonProps = PropsWithChildren<TouchableOpacityProps> & {
    style?: any; // or StyleProp<ViewStyle>
    icon?: ReactNode; // or StyleProp<ViewStyle>
    /**
     * Tightens padding for an action that sits inline with content (a row, a
     * card) rather than anchoring the bottom of a screen. Same label style, so it
     * stays recognisably the same button - a defined variant instead of a
     * per-screen padding override.
     */
    compact?: boolean;
};

export function PrimaryButton({
    children,
    style,
    compact,
    ...props
}: ButtonProps) {
    return (
        <TouchableOpacity
            {...props}
            style={[
                style,
                styles.button,
                compact && styles.buttonCompact,
                styles.primary,
            ]}
        >
            <H4 style={styles.primaryText}>{children}</H4>
        </TouchableOpacity>
    );
}

export function SecondaryButton({
    children,
    style,
    icon,
    ...props
}: ButtonProps) {
    return (
        <TouchableOpacity
            {...props}
            style={[style, styles.button, styles.secondary]}
        >
            <H4 style={[styles.secondaryText]}>{children}</H4>
            {icon}
        </TouchableOpacity>
    );
}
export function SecondaryAddButton({ children, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity
            {...props}
            style={[
                style,
                styles.button,
                styles.secondary,
                { alignItems: "flex-start" },
            ]}
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <H2 style={{ color: colors.primary }}>+ </H2>
                <H4 style={[styles.secondaryText]}>{children}</H4>
            </View>
        </TouchableOpacity>
    );
}
export function InlineButton({ children, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity {...props} style={[style]}>
            <H5
                style={[
                    styles.secondaryText,
                    { textDecorationLine: "underline" },
                ]}
            >
                {children}
            </H5>
        </TouchableOpacity>
    );
}
export function SubButton({ children, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity
            {...props}
            style={[style, styles.sub_button, { padding: 7 }]}
        >
            <H5 style={styles.secondaryText}>{children}</H5>
        </TouchableOpacity>
    );
}
export function DateButton({ children, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity {...props} style={[style, styles.date_button]}>
            <H3 style={styles.secondaryText}>{children}</H3>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 15,

        borderRadius: 7,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    buttonCompact: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    sub_button: {
        padding: 12,
        borderRadius: 22,
        alignItems: "center",
        backgroundColor: colors.primary_bg,
        alignSelf: "flex-start",
    },
    date_button: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: colors.primary_bg,
        alignSelf: "flex-start",
    },
    primary: {
        backgroundColor: colors.primary,
    },
    primaryText: {
        color: colors.white,
    },
    secondary: {
        backgroundColor: colors.white,
    },
    secondaryText: {
        color: colors.primary,
    },
    inlineText: {
        color: colors.primary,
    },
    SubText: {
        color: colors.primary,
    },
});
