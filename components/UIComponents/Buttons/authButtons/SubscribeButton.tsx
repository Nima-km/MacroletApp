import { useClerk } from "@clerk/expo";
import { Pressable, Text } from "react-native";

export default function SubscribeButton({ planId }: { planId: string }) {
	const clerk = useClerk();

	const handleStartCheckout = async () => {
		try {
			const checkout = await clerk.billing.startCheckout({
				planId: planId,
				planPeriod: "month",
			});
			console.log(
				"Checkout started! Status:",
				checkout.status,
				JSON.stringify(checkout, null, 2),
			);
		} catch (e) {
			console.error("Error starting checkout:", e);
		}
	};

	return (
		<Pressable onPress={handleStartCheckout}>
			<Text>Subscribe</Text>
		</Pressable>
	);
}
