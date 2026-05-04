import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import React, { type ComponentProps } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassDock } from '../components/GlassDock';
import { MiniPlayer } from '../components/MiniPlayer';
import {
  TabIconHome,
  TabIconLibrary,
  TabIconSearch,
  TabIconSettings,
  TabIconSocial,
} from './TabNavIcons';
import { HomeScreen } from '../screens/HomeScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

type TabBarComponentProps = ComponentProps<typeof BottomTabBar>;

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

function tabSlot(focused: boolean, node: React.ReactNode) {
  return (
    <View style={[styles.tabGlyphWrap, focused && styles.tabGlyphWrapActive]}>{node}</View>
  );
}

export function RootTabs() {
  const insets = useSafeAreaInsets();

  const renderTabBar = (props: BottomTabBarProps) => {
    const barProps = {
      ...props,
      insets: { ...props.insets, bottom: 0 },
      style: [
        (props as TabBarComponentProps).style,
        {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 52 : 56 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 6 : Math.max(insets.bottom, 8),
          paddingTop: 4,
        },
      ],
    } satisfies TabBarComponentProps;

    return (
      <GlassDock>
        <MiniPlayer />
        <BottomTabBar {...barProps} />
      </GlassDock>
    );
  };

  return (
    <NavigationContainer theme={NavTheme}>
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
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
            tabBarIcon: ({ color, focused }) =>
              tabSlot(focused, <TabIconHome color={color} focused={focused} />),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Поиск',
            tabBarIcon: ({ color, focused }) =>
              tabSlot(focused, <TabIconSearch color={color} focused={focused} />),
          }}
        />
        <Tab.Screen
          name="Library"
          component={PlaceholderScreen}
          initialParams={{ title: 'Библиотека', subtitle: 'Плейлисты и импорт' }}
          options={{
            tabBarLabel: 'Библиотека',
            tabBarIcon: ({ color, focused }) =>
              tabSlot(focused, <TabIconLibrary color={color} focused={focused} />),
          }}
        />
        <Tab.Screen
          name="Social"
          component={PlaceholderScreen}
          initialParams={{ title: 'Социальное', subtitle: 'Комнаты и друзья' }}
          options={{
            tabBarLabel: 'Соц.',
            tabBarIcon: ({ color, focused }) =>
              tabSlot(focused, <TabIconSocial color={color} focused={focused} />),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: 'Настройки',
            tabBarIcon: ({ color, focused }) =>
              tabSlot(focused, <TabIconSettings color={color} focused={focused} />),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabGlyphWrap: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGlyphWrapActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.18)',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
});
