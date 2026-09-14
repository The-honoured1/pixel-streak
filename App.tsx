import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HabitProvider } from './src/context/HabitContext';
import { HabitsScreen } from './src/screens/HabitsScreen';
import { CanvasScreen } from './src/screens/CanvasScreen';
import { StatsScreen } from './src/screens/StatsScreen';

type Tab = 'habits' | 'canvas' | 'stats';

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('habits');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      
      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {activeTab === 'habits' && <HabitsScreen />}
        {activeTab === 'canvas' && <CanvasScreen />}
        {activeTab === 'stats' && <StatsScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'habits' && styles.navItemActive]}
          onPress={() => setActiveTab('habits')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'habits' ? 'calendar-check' : 'calendar-check-outline'}
            size={22}
            color={activeTab === 'habits' ? '#38bdf8' : '#8b949e'}
          />
          <Text style={[styles.navText, activeTab === 'habits' && styles.navTextActive]}>
            Habits
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'canvas' && styles.navItemActive]}
          onPress={() => setActiveTab('canvas')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'canvas' ? 'view-grid' : 'view-grid-outline'}
            size={22}
            color={activeTab === 'canvas' ? '#39d353' : '#8b949e'}
          />
          <Text style={[styles.navText, activeTab === 'canvas' && styles.navTextActive]}>
            Pixel Canvas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'stats' && styles.navItemActive]}
          onPress={() => setActiveTab('stats')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'stats' ? 'chart-box' : 'chart-box-outline'}
            size={22}
            color={activeTab === 'stats' ? '#ff7b00' : '#8b949e'}
          />
          <Text style={[styles.navText, activeTab === 'stats' && styles.navTextActive]}>
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
    backgroundColor: '#0d1117',
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  navText: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  navTextActive: {
    color: '#f0f6fc',
    fontWeight: '700',
  },
});
