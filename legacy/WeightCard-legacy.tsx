/**
 * The Home weight card as it stood before the redesign, preserved for reference.
 * Superseded by `components/UIComponents/Cards/WeightCard.tsx`.
 *
 * Kept verbatim: the card showed a title, a decorative "+", a "Weekly Average" label
 * with no value, a floating "lbs" unit and the 7-point chart. Kept here so the
 * before/after is reviewable without digging through git history.
 */
import Plus from "@/assets/svg/plus-empty.svg";
import WeightLogChartSmall from "@/components/chartComponents/LogHistoryCharts/WeightLogChartSmall";
import { H2, H3, H5 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import { WeightHistoryRecord } from "@/types/weight";
import React from "react";
import { Pressable, View } from "react-native";

type Props = {
	WeightData?: WeightHistoryRecord[];
	onPress: () => void;
};

export default function WeightCardLegacy({ WeightData, onPress }: Props) {
	return (
		<View style={{ padding: 20 }}>
			<Pressable onPress={onPress}>
				<View
					style={{
						backgroundColor: colors.white,
						borderRadius: 8,
						padding: 20,
						gap: 20,
					}}
				>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
						}}
					>
						<H2>Weight</H2>
						<Plus color={colors.primary} height={25} width={25} />
					</View>
					<View style={{ alignItems: "center" }}>
						<H3>Weekly Average</H3>
					</View>
					<H5>lbs</H5>
					<WeightLogChartSmall
						weightData={WeightData?.length == 0 ? undefined : WeightData}
					/>
				</View>
			</Pressable>
		</View>
	);
}
