import { toApiError } from "./errors";

/**
 * Reporting content.
 *
 * One endpoint for every surface: the client sends the public reference it already
 * has (a recipe slug, a username, a review id), never an internal id. The server
 * resolves it and rejects a report that is duplicated or whose target has gone.
 */

export type ReportTargetType = "recipe" | "review" | "creator";

export const REPORT_REASONS = [
	{ value: "spam", label: "Spam" },
	{ value: "harassment", label: "Harassment or abuse" },
	{ value: "inappropriate_content", label: "Inappropriate content" },
	{ value: "misleading_information", label: "Misleading information" },
	{ value: "impersonation", label: "Impersonation" },
	{ value: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export const createReport = async (
	token: string,
	input: {
		targetType: ReportTargetType;
		targetRef: string;
		reason: ReportReason;
		details?: string;
	},
): Promise<void> => {
	const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reports`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			target_type: input.targetType,
			target_ref: input.targetRef,
			reason: input.reason,
			details: input.details?.trim() ? input.details.trim() : undefined,
		}),
	});
	if (!res.ok) throw await toApiError(res);
};
