import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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

const TAB_ORDER = ['Wave', 'Search', 'Library', 'Social', 'Settings'];
const TAB_LABELS: Record<string, string> = {
  Wave: 'Моя волна',
  Search: 'Поиск',
  Library: 'Библиотека',
  Social: 'Соц.',
  Settings: 'Настройки',
};

const TAB_ICONS: Record<
  string,
  (props: { color: string; focused: boolean; size?: number }) => React.ReactNode
> = {
  Wave: props => <TabIconHome {...props} />,
  Search: props => <TabIconSearch {...props} />,
  Library: props => <TabIconLibrary {...props} />,
  Social: props => <TabIconSocial {...props} />,
  Settings: props => <TabIconSettings {...props} />,
};

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
    <View style={[styles.tabGlyphWrap, focused && styles.tabGlyphWrapActive]}>
      {focused ? <AnimatedChromeRing /> : null}
      <View style={styles.tabIconLayer}>{node}</View>
    </View>
  );
}

function AnimatedChromeRing() {
  const spin = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2600,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.chromeRing,
        {
          transform: [
            {
              rotate: spin.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}>
      <Svg width="100%" height="100%" viewBox="0 0 48 48">
        <Defs>
          <LinearGradient id="activeIconChrome" x1="0" y1="6" x2="48" y2="42">
            <Stop offset="0" stopColor="#a855f7" stopOpacity="0.96" />
            <Stop offset="0.35" stopColor="#38bdf8" stopOpacity="0.94" />
            <Stop offset="0.68" stopColor="#ec4899" stopOpacity="0.96" />
            <Stop offset="1" stopColor="#f8fafc" stopOpacity="0.82" />
          </LinearGradient>
        </Defs>
        <Circle
          cx="24"
          cy="24"
          r="19.5"
          fill="none"
          stroke="url(#activeIconChrome)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

function GlassTabButton({
  color,
  focused,
  icon,
  label,
  onLongPress,
  onPress,
}: {
  color: string;
  focused: boolean;
  icon: React.ReactNode;
  label: string;
  onLongPress: () => void;
  onPress: () => void;
}) {
  const progress = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(progress, {
        toValue: focused ? 1 : 0,
        damping: 16,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, progress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}>
      <Animated.View
        style={{
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.72, 1],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1.08],
              }),
            },
          ],
        }}>
        {tabSlot(focused, icon)}
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          focused ? styles.tabLabelActive : styles.tabLabelInactive,
          {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.62, 1],
            }),
          },
        ]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export function RootTabs() {
  const renderTabBar = (props: BottomTabBarProps) => {
    const activeIndex = TAB_ORDER.indexOf(String(props.state.routes[props.state.index]?.name));

    return (
      <GlassDock activeIndex={activeIndex < 0 ? props.state.index : activeIndex}>
        <MiniPlayer />
        <View style={styles.tabsRow}>
          {props.state.routes.map((route, index) => {
            const focused = props.state.index === index;
            const color = focused ? '#ffffff' : 'rgba(214,205,230,0.58)';
            const label = TAB_LABELS[route.name] || route.name;
            const icon = TAB_ICONS[route.name]?.({
              color,
              focused,
              size: focused ? 25 : 23,
            });

            const onPress = () => {
              const event = props.navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                props.navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              props.navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <GlassTabButton
                key={route.key}
                color={color}
                focused={focused}
                icon={icon}
                label={label}
                onLongPress={onLongPress}
                onPress={onPress}
              />
            );
          })}
        </View>
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
  tabsRow: {
    height: Platform.OS === 'ios' ? 62 : 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 7,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabGlyphWrap: {
    width: 48,
    height: 40,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGlyphWrapActive: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 7,
  },
  tabIconLayer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  chromeRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    top: -4,
    left: 0,
  },
  tabLabel: {
    maxWidth: 72,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  tabLabelInactive: {
    color: 'rgba(214,205,230,0.52)',
  },
});
