export const bigRound = (value: number | undefined, round: number) => {
    return Math.round((value ?? 0) / round) * round;
};
