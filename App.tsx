/**
 * Flow — React Native (iOS-first).
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GatewayTokenWarmup } from './src/bootstrap/GatewayTokenWarmup';
import { AppBackground } from './src/components/AppBackground';
import { BootLoading } from './src/components/BootLoading';
import { FlowSettingsProvider } from './src/context/FlowSettingsContext';
import { PlaybackProvider } from './src/context/PlaybackContext';
import { SocialAuthProvider, useSocialAuth } from './src/context/SocialAuthContext';
import { RootTabs } from './src/navigation/RootTabs';
import { AuthScreen } from './src/screens/AuthScreen';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FlowSettingsProvider>
          <GatewayTokenWarmup />
          <SocialAuthProvider>
            <PlaybackProvider>
              <StatusBar barStyle="light-content" />
              <AppBackground>
                <AppEntry />
              </AppBackground>
            </PlaybackProvider>
          </SocialAuthProvider>
        </FlowSettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppEntry() {
  const { ready, username } = useSocialAuth();
  if (!ready) return <BootLoading />;
  if (!username) return <AuthScreen />;
  return (
    <RootTabs />
  );
}

export default App;
