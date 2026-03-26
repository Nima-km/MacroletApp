import React, { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
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
        /*  <Pressable
            onPress={Keyboard.dismiss}
            accessible={false}
            style={{ flex: 1 }}
        >*/
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0} // adjust if header is present
        >
            <ScrollView
                nestedScrollEnabled={true}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={scrollEnabled}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
        //   </Pressable>
    );
};

export default KeyboardAware;

const styles = StyleSheet.create({});
