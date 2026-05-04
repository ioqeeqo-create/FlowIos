/**
 * Flow — React Native (iOS-first).
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GatewayTokenWarmup } from './src/bootstrap/GatewayTokenWarmup';
import { FlowSettingsProvider } from './src/context/FlowSettingsContext';
import { PlaybackProvider } from './src/context/PlaybackContext';
import { RootTabs } from './src/navigation/RootTabs';

function App() {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FlowSettingsProvider>
          <GatewayTokenWarmup />
          <PlaybackProvider>
            <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
            <RootTabs />
          </PlaybackProvider>
        </FlowSettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
