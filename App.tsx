/**
 * Flow — React Native (iOS-first).
 *
 * @format
 */

import React from 'react';
import { StatusBar, Text, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GatewayTokenWarmup } from './src/bootstrap/GatewayTokenWarmup';
import { AppBackground } from './src/components/AppBackground';
import { MINECRAFT_FONT } from './src/constants/theme';
import { FlowSettingsProvider } from './src/context/FlowSettingsContext';
import { PlaybackProvider } from './src/context/PlaybackContext';
import { RootTabs } from './src/navigation/RootTabs';

Text.defaultProps = {
  ...(Text.defaultProps || {}),
  style: [{ fontFamily: MINECRAFT_FONT }, Text.defaultProps?.style],
};
TextInput.defaultProps = {
  ...(TextInput.defaultProps || {}),
  style: [{ fontFamily: MINECRAFT_FONT }, TextInput.defaultProps?.style],
};

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FlowSettingsProvider>
          <GatewayTokenWarmup />
          <PlaybackProvider>
            <StatusBar barStyle="light-content" />
            <AppBackground>
              <RootTabs />
            </AppBackground>
          </PlaybackProvider>
        </FlowSettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
