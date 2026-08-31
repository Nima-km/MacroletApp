import React from "react";
import { StyleSheet, View } from "react-native";
import HeaderSimple from "../navComponents/HeaderSimple";
import { H2 } from "../UIComponents/Typography";

const Preferences = () => {
	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple />
			<View style={{ flex: 1, padding: 20 }}>
				<H2>Discover Preferences</H2>
			</View>
		</View>
	);
};

export default Preferences;

const styles = StyleSheet.create({});
