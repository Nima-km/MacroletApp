import React, { ReactNode, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue } from "react-native-reanimated";

type SwipeableCoreProps = {
    children: ReactNode;
    underChildren: ReactNode;
    backgroundColor: string;
    autoClose?: boolean;
    onPress: () => void;
    onSwipe?: () => void;
};

type RightActionProps = {
    prog: SharedValue<number>;
    drag: SharedValue<number>;
    children: ReactNode;
    backgroundColor: string;
    onPress: () => void;
};

function RightAction({
    prog,
    drag,
    children,
    onPress,
    backgroundColor,
}: RightActionProps) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                width: 120,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
                marginLeft: -60,
                backgroundColor: backgroundColor,
                //  justifyContent: "center",
                //   alignItems: "center",
            }}
        >
            <View
                style={{
                    flex: 1,
                    borderTopRightRadius: 8,
                    marginLeft: 60,
                    // justifyContent: "center",
                    //   alignItems: "center",
                    borderBottomRightRadius: 8,
                }}
            >
                {children}
            </View>
        </Pressable>
    );
}

export default function SwipeableCore({
    children,
    onPress,
    underChildren,
    backgroundColor,
    autoClose = false,
    onSwipe = () => {},
}: SwipeableCoreProps) {
    const swipeableRef = useRef<Swipeable>(null);

    function onSwipped() {
        onSwipe();
        autoClose && swipeableRef.current?.close();
    }
    return (
        <ReanimatedSwipeable
            rightThreshold={30}
            ref={swipeableRef}
            friction={1}
            renderRightActions={(prog, drag) => (
                <RightAction
                    prog={prog}
                    drag={drag}
                    onPress={onPress}
                    backgroundColor={backgroundColor}
                >
                    {underChildren}
                </RightAction>
            )}
            onSwipeableOpen={onSwipped}
        >
            {children}
        </ReanimatedSwipeable>
    );
}

const styles = StyleSheet.create({
    rightAction: { width: 50, height: 50, backgroundColor: "red" },
    separator: {
        width: "100%",
        borderTopWidth: 1,
    },
    swipeable: {
        height: 30,
        alignItems: "center",
    },
});
