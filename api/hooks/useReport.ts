import { createReport, ReportReason, ReportTargetType } from "@/api/reports";
import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

/**
 * Submit a content report.
 *
 * A repeat report comes back as 409, which is a normal outcome rather than a failure
 * worth alarming someone about - so it gets its own message instead of the generic
 * error toast.
 */
export const useCreateReport = () => {
	const { getToken } = useAuth();

	return useMutation({
		mutationFn: async (input: {
			targetType: ReportTargetType;
			targetRef: string;
			reason: ReportReason;
			details?: string;
		}) => {
			const token = await getToken();
			if (!token) throw new Error("Sign in to report content.");
			await createReport(token, input);
		},
		onSuccess: () =>
			Toast.show({
				type: "success",
				text1: "Thanks — we'll take a look",
			}),
		onError: (error) => {
			const message =
				error instanceof Error ? error.message : undefined;
			const already = /already reported/i.test(message ?? "");
			Toast.show({
				type: already ? "info" : "error",
				text1: already ? "Already reported" : "Couldn't send the report",
				text2: already ? "You've reported this already." : message,
			});
		},
	});
};
