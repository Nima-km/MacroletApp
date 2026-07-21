import ArrowLeft from "@/assets/svg/chevron-left.svg";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import HeaderCore from "./HeaderCore";
interface HeaderSimpleProps {
	title?: string;

	back?: boolean;
	logo?: ReactNode;
	dateSelector?: boolean;
}

const HeaderSimple = ({
	title,
	back = true,
	logo,
	dateSelector = false,
}: HeaderSimpleProps) => {
	const router = useRouter();
	return (
		<HeaderCore
			title={title}
			logo={logo}
			dateSelector={dateSelector}
			LeftButton={
				back ? (
					<Pressable
						style={{
							height: 50,
							width: 70,
							justifyContent: "center",
						}}
						onPress={() => router.back()}
					>
						<ArrowLeft color={colors.primary} />
					</Pressable>
				) : null
			}
		/>
	);
};

export default HeaderSimple;

const styles = StyleSheet.create({});
