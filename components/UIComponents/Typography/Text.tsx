import { typography } from "@/theme";
import { Text as RNText, TextProps } from "react-native";


export function H1(props: TextProps) {
    return (
        <RNText
            {...props}
            style={[typography.h1,
                props.style,
            ]}
        />
    );
}
export function H2(props: TextProps) {
    return (
        <RNText
            {...props}
            style={[typography.h2,
                props.style,
            ]}
        />
    );
}
export function H3(props: TextProps) {
    return (
        <RNText
            {...props}
            style={[typography.h3,
                props.style,
            ]}
        />
    );
}
export function H4_Bold(props: TextProps) {
    return (
        <RNText
            {...props}
            style={[typography.h4_Bold,
                props.style,
            ]}
        />
    );
}
export function H4(props: TextProps) {
    return (
        <RNText
            {...props}
            style={[
                typography.h4_Bold,
                props.style,
            ]}
        />
    );
}
export function H5(props: TextProps) {
    return (
        <RNText
            {...props}
            style={[typography.h5,
                props.style,
            ]}
        />
    );
}
export function H5_SemiBold(props: TextProps) {
    return (
        <RNText
            {...props}
            style={[typography.h5_SemiBold,
                props.style,
            ]}
        />
    );
}
export function H6(props: TextProps) {
    return (
        <RNText
            {...props}
            style={[typography.h6,
                props.style,
            ]}
        />
    );
}