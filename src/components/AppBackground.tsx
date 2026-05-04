import React from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';
import { useFlowSettings } from '../context/FlowSettingsContext';

type Props = {
  children: React.ReactNode;
};

export function AppBackground({ children }: Props) {
  const { backgroundUri, backgroundRotateDeg, backgroundScale, backgroundDim } = useFlowSettings();
  const orbA = React.useRef(new Animated.Value(0)).current;
  const orbB = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(orbA, { toValue: 1, duration: 9000, useNativeDriver: true }),
        Animated.timing(orbA, { toValue: 0, duration: 9000, useNativeDriver: true }),
      ]),
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(orbB, { toValue: 0, duration: 11000, useNativeDriver: true }),
        Animated.timing(orbB, { toValue: 1, duration: 11000, useNativeDriver: true }),
      ]),
    );
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, [orbA, orbB]);

  const orbs = (
    <View pointerEvents="none" style={styles.orbsWrap}>
      <Animated.View
        style={[
          styles.orb,
          styles.orbPurple,
          {
            opacity: orbA.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.36] }),
            transform: [
              { translateX: orbA.interpolate({ inputRange: [0, 1], outputRange: [-40, 24] }) },
              { translateY: orbA.interpolate({ inputRange: [0, 1], outputRange: [20, -22] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbBlue,
          {
            opacity: orbB.interpolate({ inputRange: [0, 1], outputRange: [0.16, 0.34] }),
            transform: [
              { translateX: orbB.interpolate({ inputRange: [0, 1], outputRange: [26, -32] }) },
              { translateY: orbB.interpolate({ inputRange: [0, 1], outputRange: [-36, 14] }) },
            ],
          },
        ]}
      />
    </View>
  );

  if (!backgroundUri) {
    return (
      <View style={styles.solid}>
        {orbs}
        {children}
      </View>
    );
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
      {orbs}
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
  orbsWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  orbPurple: {
    right: -82,
    bottom: 44,
    backgroundColor: 'rgba(168,85,247,0.42)',
  },
  orbBlue: {
    left: -96,
    top: 90,
    backgroundColor: 'rgba(56,189,248,0.34)',
  },
});
