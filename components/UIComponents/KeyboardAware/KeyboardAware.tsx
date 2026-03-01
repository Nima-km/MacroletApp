import React, { ReactNode } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";

interface KeyboardScreenProps {
    children: ReactNode;
    scrollEnabled?: boolean;
    contentPadding?: number;
}

const KeyboardAware = ({
    children,
    scrollEnabled = true,
    contentPadding = 16,
}: KeyboardScreenProps) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0} // adjust if header is present
        >
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
            >
                <ScrollView
                    nestedScrollEnabled={true}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={scrollEnabled}
                >
                    {children}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default KeyboardAware;

const styles = StyleSheet.create({});
