import React from "react";
import RatingStars from "./RatingStars";
type Props = {
	rating: number;
};

const RatedChart = ({ rating }: Props) => {
	return <RatingStars rating={rating} size={20} />;
};

export default RatedChart;
