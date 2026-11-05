import {
	clearWeightGoal,
	getAllWeightGoals,
	getLatestWeightGoal,
	saveWeightGoal,
} from "@/db/queries/weightGoal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["weight-goal"];
const ALL = ["weight-goals"];

export const useGetWeightGoal = () =>
	useQuery({
		queryKey: KEY,
		queryFn: getLatestWeightGoal,
	});

export const useSaveWeightGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: saveWeightGoal,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: KEY });
			queryClient.invalidateQueries({ queryKey: ALL });
		},
	});
};

export const useClearWeightGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: clearWeightGoal,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: KEY });
			queryClient.invalidateQueries({ queryKey: ALL });
		},
	});
};

/** Every goal, oldest first — for the stepped line on the chart. */
export const useGetWeightGoals = () =>
	useQuery({
		queryKey: ["weight-goals"],
		queryFn: getAllWeightGoals,
	});
