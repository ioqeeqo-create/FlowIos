import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MiniPlayer } from '../components/MiniPlayer';
import { HomeScreen } from '../screens/HomeScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#07070d',
    card: '#0f0f18',
    primary: '#a855f7',
    text: '#f4f4f8',
    border: '#27273a',
  },
};

function tabIcon(focused: boolean, glyph: string) {
  return (
    <View style={[styles.tabGlyphWrap, focused && styles.tabGlyphWrapActive]}>
      <Text style={[styles.tabGlyph, focused && styles.tabGlyphActive]}>{glyph}</Text>
    </View>
  );
}

export function RootTabs() {
  const insets = useSafeAreaInsets();

  const renderTabBar = (props: BottomTabBarProps) => (
    <View style={styles.tabBarCol}>
      <MiniPlayer />
      <BottomTabBar {...props} />
    </View>
  );

  return (
    <NavigationContainer theme={NavTheme}>
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0a0a12',
            borderTopColor: '#27273a',
            height: 56 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#c084fc',
          tabBarInactiveTintColor: '#6b6b80',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}>
        <Tab.Screen
          name="Wave"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Моя волна',
            tabBarIcon: ({ focused }) => tabIcon(focused, '⌂'),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Поиск',
            tabBarIcon: ({ focused }) => tabIcon(focused, '⌕'),
          }}
        />
        <Tab.Screen
          name="Library"
          component={PlaceholderScreen}
          initialParams={{ title: 'Библиотека', subtitle: 'Плейлисты и импорт' }}
          options={{
            tabBarLabel: 'Библиотека',
            tabBarIcon: ({ focused }) => tabIcon(focused, '▤'),
          }}
        />
        <Tab.Screen
          name="Social"
          component={PlaceholderScreen}
          initialParams={{ title: 'Социальное', subtitle: 'Комнаты и друзья' }}
          options={{
            tabBarLabel: 'Соц.',
            tabBarIcon: ({ focused }) => tabIcon(focused, '◎'),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Настройки',
            tabBarIcon: ({ focused }) => tabIcon(focused, '⚙'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarCol: {
    backgroundColor: '#0a0a12',
  },
  tabGlyphWrap: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabGlyphWrapActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  tabGlyph: {
    fontSize: 18,
    color: '#6b6b80',
  },
  tabGlyphActive: {
    color: '#e9d5ff',
  },
});
