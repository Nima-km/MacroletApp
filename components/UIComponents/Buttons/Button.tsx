import { colors } from "@/theme";
import { PropsWithChildren } from "react";
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { H4, H5 } from "../Typography";

type ButtonProps = PropsWithChildren<TouchableOpacityProps> & {
    style?: any; // or StyleProp<ViewStyle>
};

export function PrimaryButton({ children, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity {...props} style={[style, styles.button, styles.primary]}>
            <H4 style={styles.primaryText}>{children}</H4>
        </TouchableOpacity>
    );
}

export function SecondaryButton({ children, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity {...props} style={[style, styles.button, styles.secondary]}>
            <H4 style={styles.secondaryText}>{children}</H4>
        </TouchableOpacity>
    );
}
export function InlineButton({ children, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity {...props}>
            <H5 style={styles.secondaryText}>{children}</H5>
        </TouchableOpacity>
    );
}
export function SubButton({ children, style, ...props }: ButtonProps) {
    return (
        <TouchableOpacity {...props} style={[style, styles.sub_button]}>
            <H5 style={styles.secondaryText}>{children}</H5>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 7,
    alignItems: 'center',
  },
  sub_button: {
    padding: 12,
    borderRadius: 22,
    alignItems: 'center',
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