import React, { ReactNode, useState } from "react";
import {
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
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
    const [scrollPositions, setScrollPositions] = useState(0);
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollY = event.nativeEvent.contentOffset.y;

        setScrollPositions((prev) => scrollY);
        console.log("scroll position", scrollY);
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0} // adjust if header is present
        >
            <ScrollView
                nestedScrollEnabled={true}
                onScroll={handleScroll}
                keyboardDismissMode="none"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                scrollEnabled={scrollEnabled}
            >
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default KeyboardAware;

const styles = StyleSheet.create({});
