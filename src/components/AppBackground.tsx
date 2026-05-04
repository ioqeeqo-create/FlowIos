import React from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';
import { DEEP_BG } from '../constants/theme';
import { useFlowSettings } from '../context/FlowSettingsContext';

type Props = {
  children: React.ReactNode;
};

/** Subtle mesh haze (no extra deps) — reads as depth behind glass. */
function AmbientMesh() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.meshStripe, { top: '12%', opacity: 0.07, backgroundColor: '#a855f7' }]} />
      <View style={[styles.meshStripe, { top: '38%', opacity: 0.05, backgroundColor: '#22d3ee' }]} />
      <View style={[styles.meshStripe, { top: '62%', opacity: 0.06, backgroundColor: '#f472b6' }]} />
    </View>
  );
}

export function AppBackground({ children }: Props) {
  const { backgroundUri, backgroundRotateDeg, backgroundScale, backgroundDim } = useFlowSettings();
  const orbA = React.useRef(new Animated.Value(0)).current;
  const orbB = React.useRef(new Animated.Value(1)).current;
  const orbC = React.useRef(new Animated.Value(0)).current;
  const drift = React.useRef(new Animated.Value(0)).current;

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
    const loopC = Animated.loop(
      Animated.sequence([
        Animated.timing(orbC, { toValue: 1, duration: 13000, useNativeDriver: true }),
        Animated.timing(orbC, { toValue: 0, duration: 13000, useNativeDriver: true }),
      ]),
    );
    const loopDrift = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 14000, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 14000, useNativeDriver: true }),
      ]),
    );
    loopA.start();
    loopB.start();
    loopC.start();
    loopDrift.start();
    return () => {
      loopA.stop();
      loopB.stop();
      loopC.stop();
      loopDrift.stop();
    };
  }, [orbA, orbB, orbC, drift]);

  const parallaxLayer = (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.parallax,
        {
          transform: [
            {
              translateX: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [-5, 6],
              }),
            },
            {
              translateY: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [4, -5],
              }),
            },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );

  const orbs = (
    <View pointerEvents="none" style={styles.orbsWrap}>
      <AmbientMesh />
      <Animated.View
        style={[
          styles.orb,
          styles.orbPurple,
          {
            opacity: orbA.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.42] }),
            transform: [
              { translateX: orbA.interpolate({ inputRange: [0, 1], outputRange: [-44, 28] }) },
              { translateY: orbA.interpolate({ inputRange: [0, 1], outputRange: [22, -26] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbBlue,
          {
            opacity: orbB.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.38] }),
            transform: [
              { translateX: orbB.interpolate({ inputRange: [0, 1], outputRange: [30, -36] }) },
              { translateY: orbB.interpolate({ inputRange: [0, 1], outputRange: [-40, 16] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbPink,
          {
            opacity: orbC.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.28] }),
            transform: [
              { translateX: orbC.interpolate({ inputRange: [0, 1], outputRange: [-20, 18] }) },
              { translateY: orbC.interpolate({ inputRange: [0, 1], outputRange: [-120, -96] }) },
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
        {parallaxLayer}
      </View>
    );
  }

  return (
    <View style={styles.solid}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              {
                translateX: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, -3],
                }),
              },
              {
                scale: drift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.02, 1.06],
                }),
              },
            ],
          },
        ]}>
        <ImageBackground
          source={{ uri: backgroundUri }}
          style={StyleSheet.absoluteFill}
          imageStyle={[
            styles.image,
            {
              transform: [{ scale: backgroundScale }, { rotate: `${backgroundRotateDeg}deg` }],
            },
          ]}
        />
      </Animated.View>
      {orbs}
      <View style={[styles.darken, { backgroundColor: `rgba(0,0,0,${backgroundDim})` }]} />
      {parallaxLayer}
    </View>
  );
}

const styles = StyleSheet.create({
  solid: {
    flex: 1,
    backgroundColor: DEEP_BG,
  },
  parallax: {
    flex: 1,
  },
  image: {
    opacity: 1,
  },
  darken: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  orbsWrap: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  meshStripe: {
    position: 'absolute',
    left: -80,
    right: -80,
    height: 120,
    transform: [{ rotate: '-8deg' }],
    borderRadius: 80,
  },
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  orbPurple: {
    right: -90,
    bottom: 36,
    backgroundColor: 'rgba(168,85,247,0.48)',
  },
  orbBlue: {
    left: -100,
    top: 80,
    backgroundColor: 'rgba(56,189,248,0.4)',
  },
  orbPink: {
    right: 40,
    top: -40,
    backgroundColor: 'rgba(244,114,182,0.36)',
  },
});
