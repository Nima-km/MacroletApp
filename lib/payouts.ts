import type { PayoutState } from "@/api/creator";
import type { StatusTone } from "@/components/UIComponents/Badges/StatusBadge";

/**
 * How a payout state reads to a creator, in one place.
 *
 * Both the Creator Studio hub and the earnings screen present this state, and
 * they must never disagree about what "onboarded" means to a human.
 */
const LABELS: Record<PayoutState, string> = {
	pending: "Not set up",
	onboarded: "In review",
	payouts_enabled: "Ready",
	restricted: "Action needed",
};

const TONES: Record<PayoutState, StatusTone> = {
	pending: "info",
	onboarded: "info",
	payouts_enabled: "positive",
	restricted: "warning",
};

export const payoutLabel = (state: PayoutState | null | undefined): string =>
	state ? (LABELS[state] ?? state) : LABELS.pending;

export const payoutTone = (state: PayoutState | null | undefined): StatusTone =>
	state ? (TONES[state] ?? "info") : "info";

export const formatCents = (cents: number): string =>
	(cents / 100).toLocaleString(undefined, {
		style: "currency",
		currency: "USD",
	});

/**
 * One line summarising where the money is, for a row or a card.
 * Deliberately never says "zero" - a creator with nothing pending needs a next
 * step, not a balance.
 */
export function payoutSummary(status: {
	payout_state: PayoutState | null;
	payouts_ready: boolean;
	creator: {
		pending_balance_cents: number;
		unpayable_cents: number;
	} | null;
}): string {
	const pending = status.creator?.pending_balance_cents ?? 0;
	const held = status.creator?.unpayable_cents ?? 0;

	if (status.payouts_ready) {
		return pending > 0
			? `${formatCents(pending)} ready to pay out`
			: "Payouts are set up";
	}
	if (held > 0) return `${formatCents(held)} waiting for you`;
	return "Set up payouts to get paid";
}
