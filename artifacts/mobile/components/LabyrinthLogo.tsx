import React from "react";
import { Image, StyleSheet } from "react-native";

interface LabyrinthLogoProps {
  size?: number;
}

export function LabyrinthLogo({ size = 40 }: LabyrinthLogoProps) {
  return (
    <Image
      source={require("@/assets/images/thread-logo.png")}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    borderRadius: 8,
  },
});
