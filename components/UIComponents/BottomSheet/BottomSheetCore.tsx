// components/BottomSheetCore.tsx
import { colors } from "@/theme";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFooter,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, ReactNode, useCallback, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = {
    snapPoints?: (string | number)[];
    enablePanDownToClose?: boolean;
    style?: ViewStyle;
    children: ReactNode;
    footer?: ReactNode;
    header?: ReactNode;
    initialIndex?: number;
};

export const BottomSheetCore = forwardRef<BottomSheet, Props>(
    (
        {
            snapPoints = ["7%", "50%", "70%", "90%"],
            enablePanDownToClose = false,
            children,
            style,
            footer,
            header,
            initialIndex = 0,
        },
        ref,
    ) => {
        const points = useMemo(() => snapPoints, []);
        const renderFooter = useCallback(
            (props?: any) => (
                <BottomSheetFooter {...props} bottomInset={0}>
                    {footer}
                </BottomSheetFooter>
            ),
            [footer],
        );
        return (
            <BottomSheet
                ref={ref}
                snapPoints={points}
                index={initialIndex}
                footerComponent={renderFooter}
                enablePanDownToClose={enablePanDownToClose}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={1}
                        disappearsOnIndex={1}
                        enableTouchThrough
                        pressBehavior="none"
                    />
                )}
                enableContentPanningGesture={false}
                style={[styles.sheet]}
                backgroundStyle={[style]}
                handleComponent={() => (
                    <View style={{ marginBottom: 10, paddingHorizontal: 20 }}>
                        <View
                            style={{ marginVertical: 10, alignItems: "center" }}
                        >
                            <View
                                style={{
                                    width: 60,
                                    height: 5,
                                    borderRadius: 2,
                                    backgroundColor: colors.light_gray,
                                }}
                            />
                        </View>
                        {header}
                    </View>
                )}
            >
                <BottomSheetView style={styles.content}>
                    <View style={styles.content}>{children}</View>
                </BottomSheetView>
            </BottomSheet>
        );
    },
);

const styles = StyleSheet.create({
    sheet: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 10,
        //backgroundColor: 'red'
        //padding: 16,
    },
});
