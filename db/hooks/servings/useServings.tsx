
import { deleteServingSize, getFoodServingSize, insertServingSize, updateServingSize } from '@/db/queries/servings';
import { ServingSizeInsert } from '@/types/servingSize';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';



export const useGetFoodServingSize = (foodID: number, enabled = true) => {
  return useQuery({
    queryKey: ['serving', foodID],
    queryFn: () => getFoodServingSize(foodID),
    enabled: enabled && !!foodID,
  });
};

export const useInsertServingSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertServingSize,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serving"], exact: false, });
    },
  });
};

export const useUpdateServingSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServingSizeInsert }) =>
      updateServingSize(id, data),
    onSuccess: (data, variables, id) => {
      queryClient.invalidateQueries({ queryKey: ["serving", id], exact: false, });
    },
  });
};


export const useDeleteServingSize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteServingSize(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['serving'] });
    },
  });
};