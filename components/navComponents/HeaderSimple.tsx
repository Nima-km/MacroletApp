import ArrowLeft from "@/assets/svg/chevron-left.svg";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import HeaderCore from "./HeaderCore";
interface HeaderSimpleProps {
	title?: string;

	back?: boolean;
	backAction?: () => void;
	logo?: ReactNode;
	dateSelector?: boolean;
}

const HeaderSimple = ({
	title,
	back = true,
	backAction,
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
						onPress={() =>
							!backAction ? router.back() : backAction()
						}
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
