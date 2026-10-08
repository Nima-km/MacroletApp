// components/Star.tsx
import React, { useId } from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
function cubicCurve(x: number): number {
	const t = 2;
	const p = 11;
	const coeff = -(0.5 / t - 0.5) / Math.pow(0.5, p);
	return coeff * Math.pow(x - 0.5, p) + x / t + (0.5 - 0.5 / t);
}
type StarProps = {
	width?: number;
	height?: number;
	offset?: number;
	color?: string;
};

export default function Star({
	width = 23,
	height = 22,
	offset = 1,
	color = "#FEC92D",
}: StarProps) {
	const clamped = Math.min(Math.max(offset, 0), 1);
	const offsetValue = cubicCurve(clamped);
	// Unique per instance: duplicate gradient ids leak the first star's fill
	// into every other star on the same screen. React's useId contains
	// punctuation, so strip it before using it as an id.
	const gradientId = `starGradient-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
	return (
		<Svg width={width} height={height} viewBox="0 0 23 22" fill="none">
			<Path
				d="M10.7432 0.846497C10.8922 0.384601 11.5453 0.384598 11.6943 0.846497L13.6455 6.89728C13.8458 7.51789 14.425 7.93777 15.0771 7.93634L21.4336 7.92267C21.9191 7.92161 22.1209 8.54344 21.7275 8.82794L16.5771 12.5535C16.0486 12.9358 15.8274 13.6153 16.0303 14.2352L18.0078 20.2772C18.1586 20.7383 17.6303 21.1224 17.2383 20.8367L12.1035 17.0887C11.5767 16.7041 10.8608 16.7041 10.334 17.0887L5.19922 20.8367C4.80718 21.1224 4.2789 20.7383 4.42969 20.2772L6.40723 14.2352C6.61013 13.6153 6.38887 12.9358 5.86035 12.5535L0.709961 8.82794C0.316581 8.54345 0.518431 7.92161 1.00391 7.92267L7.36035 7.93634C8.01251 7.93777 8.59171 7.51789 8.79199 6.89728L10.7432 0.846497Z"
				fill={`url(#${gradientId})`}
				stroke={color}
			/>
			<Defs>
				<LinearGradient
					id={gradientId}
					x1="-2.78125"
					y1="11.742"
					x2="25.2188"
					y2="11.742"
					gradientUnits="userSpaceOnUse"
				>
					<Stop stopColor={color} />
					<Stop offset={offsetValue} stopColor={color} />
					<Stop
						offset={offsetValue}
						stopColor={color}
						stopOpacity={0}
					/>
					<Stop offset={1} stopColor={color} stopOpacity={0} />
				</LinearGradient>
			</Defs>
		</Svg>
	);
}
