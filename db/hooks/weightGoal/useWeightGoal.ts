import {
	clearWeightGoal,
	getLatestWeightGoal,
	saveWeightGoal,
} from "@/db/queries/weightGoal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["weight-goal"];

export const useGetWeightGoal = () =>
	useQuery({
		queryKey: KEY,
		queryFn: getLatestWeightGoal,
	});

export const useSaveWeightGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: saveWeightGoal,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
};

export const useClearWeightGoal = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: clearWeightGoal,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
};
