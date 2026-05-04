import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useFlowSettings } from '../context/FlowSettingsContext';

type Props = {
  children: React.ReactNode;
};

export function AppBackground({ children }: Props) {
  const { backgroundUri, backgroundRotateDeg, backgroundScale, backgroundDim } = useFlowSettings();

  if (!backgroundUri) {
    return <View style={styles.solid}>{children}</View>;
  }

  return (
    <ImageBackground
      source={{ uri: backgroundUri }}
      style={styles.solid}
      imageStyle={[
        styles.image,
        {
          transform: [{ scale: backgroundScale }, { rotate: `${backgroundRotateDeg}deg` }],
        },
      ]}>
      <View style={[styles.darken, { backgroundColor: `rgba(0,0,0,${backgroundDim})` }]} />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  solid: {
    flex: 1,
    backgroundColor: '#07070d',
  },
  image: {
    opacity: 1,
  },
  darken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
