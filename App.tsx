import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HabitProvider } from './src/context/HabitContext';
import { HabitsScreen } from './src/screens/HabitsScreen';
import { CanvasScreen } from './src/screens/CanvasScreen';
import { StatsScreen } from './src/screens/StatsScreen';

type Tab = 'habits' | 'canvas' | 'stats';

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('habits');

  const switchTab = async (tab: Tab) => {
    setActiveTab(tab);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore on unsupported platforms
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {activeTab === 'habits' && <HabitsScreen />}
        {activeTab === 'canvas' && <CanvasScreen />}
        {activeTab === 'stats' && <StatsScreen />}
      </View>

      {/* Modern Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'habits' && styles.navItemActive]}
          onPress={() => switchTab('habits')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'habits' ? 'calendar-check' : 'calendar-check-outline'}
            size={22}
            color={activeTab === 'habits' ? '#10B981' : '#64748B'}
          />
          <Text style={[styles.navText, activeTab === 'habits' && styles.navTextActiveHabits]}>
            Streaks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'canvas' && styles.navItemActive]}
          onPress={() => switchTab('canvas')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'canvas' ? 'view-grid' : 'view-grid-outline'}
            size={22}
            color={activeTab === 'canvas' ? '#06B6D4' : '#64748B'}
          />
          <Text style={[styles.navText, activeTab === 'canvas' && styles.navTextActiveCanvas]}>
            Canvas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'stats' && styles.navItemActive]}
          onPress={() => switchTab('stats')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'stats' ? 'chart-box' : 'chart-box-outline'}
            size={22}
            color={activeTab === 'stats' ? '#F97316' : '#64748B'}
          />
          <Text style={[styles.navText, activeTab === 'stats' && styles.navTextActiveStats]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <HabitProvider>
        <MainApp />
      </HabitProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0D14',
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0D111A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  navText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  navTextActiveHabits: {
    color: '#10B981',
    fontWeight: '700',
  },
  navTextActiveCanvas: {
    color: '#06B6D4',
    fontWeight: '700',
  },
  navTextActiveStats: {
    color: '#F97316',
    fontWeight: '700',
  },
});
