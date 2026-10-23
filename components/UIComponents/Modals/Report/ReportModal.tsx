import {
	REPORT_REASONS,
	ReportReason,
	ReportTargetType,
} from "@/api/reports";
import { useCreateReport } from "@/api/hooks/useReport";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H3, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import React, { useCallback, useState } from "react";
import {
	Modal,
	Pressable,
	StyleSheet,
	TextInput,
	View,
} from "react-native";

type Props = {
	visible: boolean;
	onClose: () => void;
	target: {
		type: ReportTargetType;
		/** The public reference the caller already holds. */
		ref: string;
		/** Where the report concerns a person, for the sheet's own wording. */
		label?: string;
	} | null;
};

/**
 * The reporting sheet.
 *
 * One reason must be chosen, and "Something else" needs a sentence - a report nobody
 * can act on is worse than none. Reasons are the same list the API validates, so the
 * client cannot offer something the server will reject.
 */
export default function ReportModal({ visible, onClose, target }: Props) {
	const [reason, setReason] = useState<ReportReason>("spam");
	const [details, setDetails] = useState("");
	const { mutate, isPending } = useCreateReport();

	const needsDetails = reason === "other";
	const canSubmit = !isPending && (!needsDetails || details.trim().length > 0);

	const submit = useCallback(() => {
		if (!target || !canSubmit) return;
		mutate(
			{
				targetType: target.type,
				targetRef: target.ref,
				reason,
				details: details.trim() || undefined,
			},
			{
				onSuccess: () => {
					setDetails("");
					setReason("spam");
					onClose();
				},
			},
		);
	}, [target, canSubmit, mutate, reason, details, onClose]);

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable style={styles.sheet} onPress={() => {}}>
					<H3>Report {target?.label ?? "content"}</H3>
					<H6 style={styles.muted}>
						Reports are private. We review them and act on anything
						that breaks the rules.
					</H6>

					<View style={styles.reasons}>
						{REPORT_REASONS.map((option) => {
							const selected = reason === option.value;
							return (
								<Pressable
									key={option.value}
									onPress={() => setReason(option.value)}
									style={[
										styles.reason,
										selected && styles.reasonSelected,
									]}
									accessibilityRole="radio"
									accessibilityState={{ selected }}
								>
									<View
										style={[
											styles.dot,
											selected && styles.dotSelected,
										]}
									/>
									<H5>{option.label}</H5>
								</Pressable>
							);
						})}
					</View>

					<TextInput
						value={details}
						onChangeText={setDetails}
						placeholder={
							needsDetails
								? "What's the problem?"
								: "Anything else? (optional)"
						}
						placeholderTextColor={colors.inactive}
						style={styles.input}
						multiline
						maxLength={500}
					/>

					<View style={styles.actions}>
						<Pressable onPress={onClose} style={styles.cancel}>
							<H5 style={styles.muted}>Cancel</H5>
						</Pressable>
						<PrimaryButton
							compact
							onPress={submit}
							disabled={!canSubmit}
							style={{ opacity: canSubmit ? 1 : 0.5 }}
						>
							{isPending ? "Sending…" : "Send report"}
						</PrimaryButton>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		padding: 16,
		gap: 12,
	},
	muted: {
		color: colors.inactive,
	},
	reasons: {
		gap: 4,
	},
	reason: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 10,
	},
	reasonSelected: {
		// Selected state is the dot plus a tinted row, not a border: flat cards.
		backgroundColor: colors.primary_bg,
		borderRadius: 8,
		paddingHorizontal: 10,
	},
	dot: {
		width: 16,
		height: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.light_gray,
	},
	dotSelected: {
		borderWidth: 5,
		borderColor: colors.primary,
	},
	input: {
		backgroundColor: colors.off_white,
		borderRadius: 8,
		padding: 12,
		minHeight: 64,
		textAlignVertical: "top",
		color: colors.black,
	},
	actions: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	cancel: {
		paddingVertical: 12,
		paddingHorizontal: 8,
	},
});
