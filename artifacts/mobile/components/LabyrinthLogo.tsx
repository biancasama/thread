import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import Colors from "@/constants/colors";

interface LabyrinthLogoProps {
  size?: number;
}

export function LabyrinthLogo({ size = 40 }: LabyrinthLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="19" fill="none" stroke={Colors.light.border} strokeWidth="1" />
      <Path
        d="M20 6 A14 14 0 0 1 34 20"
        fill="none"
        stroke={Colors.light.text}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.15}
      />
      <Path
        d="M34 20 A14 14 0 0 1 20 34"
        fill="none"
        stroke={Colors.light.text}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.15}
      />
      <Path
        d="M20 34 A14 14 0 0 1 6 20"
        fill="none"
        stroke={Colors.light.text}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.15}
      />
      <Path
        d="M6 20 A14 14 0 0 1 20 6"
        fill="none"
        stroke={Colors.light.text}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.15}
      />
      <Path
        d="M20 10 A10 10 0 0 1 30 20 A10 10 0 0 1 20 30 A10 10 0 0 1 10 20 A10 10 0 0 1 20 10"
        fill="none"
        stroke={Colors.light.text}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.15}
      />
      <Path
        d="M20 14 A6 6 0 0 1 26 20 A6 6 0 0 1 20 26 A6 6 0 0 1 14 20 A6 6 0 0 1 20 14"
        fill="none"
        stroke={Colors.light.text}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={0.15}
      />
      <Path
        d="M20 6 C20 6 28 8 31 14 C34 20 30 26 26 28 C22 30 18 28 17 24 C16 20 18 17 20 17 C22 17 23 19 22 21 C21 23 20 22 20 20"
        fill="none"
        stroke={Colors.light.tint}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="20" cy="20" r="2" fill={Colors.light.tint} />
    </Svg>
  );
}
