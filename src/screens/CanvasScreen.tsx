import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitContext';
import { PixelGrid } from '../components/PixelGrid';
import { DayDetailsModal } from '../components/DayDetailsModal';
import { PaletteKey, ViewSpan, Habit } from '../types';
import { PALETTES } from '../constants/palettes';
import { formatDisplayDate, getTodayString } from '../utils/dateUtils';

export const CanvasScreen: React.FC = () => {
  const { activeHabits, toggleRecord } = useHabits();
  const [selectedSpan, setSelectedSpan] = useState<ViewSpan>('90days');
  const [globalPalette, setGlobalPalette] = useState<PaletteKey>('emerald');
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [dayDetailsModal, setDayDetailsModal] = useState<{
    habit: Habit;
    date: string;
    level: number;
  } | null>(null);

  // Compute composite records (aggregate score or max level across all habits per date)
  const compositeRecords: Record<string, number> = useMemo(() => {
    const records: Record<string, number> = {};

    if (selectedHabitId === 'all') {
      // Aggregate across all active habits
      // Calculate fraction of habits completed that day -> scale to 1..4
      const dateCounts: Record<string, number> = {};
      const totalHabits = Math.max(1, activeHabits.length);

      activeHabits.forEach(h => {
        Object.entries(h.records).forEach(([d, lvl]) => {
          if (lvl > 0) {
            dateCounts[d] = (dateCounts[d] || 0) + 1;
          }
        });
      });

      Object.entries(dateCounts).forEach(([d, count]) => {
        const ratio = count / totalHabits;
        if (ratio <= 0.25) records[d] = 1;
        else if (ratio <= 0.5) records[d] = 2;
        else if (ratio <= 0.75) records[d] = 3;
        else records[d] = 4;
      });
    } else {
      const habit = activeHabits.find(h => h.id === selectedHabitId);
      if (habit) {
        return habit.records;
      }
    }

    return records;
  }, [activeHabits, selectedHabitId]);

  // Aggregate stats
  const canvasStats = useMemo(() => {
    const totalCompletedDays = Object.keys(compositeRecords).length;
    let totalScore = 0;
    Object.values(compositeRecords).forEach(val => (totalScore += val));

    // Find best day
    let bestDate = '';
    let maxLevel = 0;
    Object.entries(compositeRecords).forEach(([d, lvl]) => {
      if (lvl > maxLevel) {
        maxLevel = lvl;
        bestDate = d;
      }
    });

    return {
      totalCompletedDays,
      totalScore,
      bestDate,
    };
  }, [compositeRecords]);

  const activePalette = PALETTES[globalPalette] || PALETTES.emerald;

  const handlePixelPress = (date: string, level: number) => {
    // If a specific habit is selected, open its day modal
    if (selectedHabitId !== 'all') {
      const habit = activeHabits.find(h => h.id === selectedHabitId);
      if (habit) {
        setDayDetailsModal({ habit, date, level });
      }
    } else if (activeHabits.length > 0) {
      // Default to the first active habit for quick editing
      setDayDetailsModal({ habit: activeHabits[0], date, level });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>VISUAL MATRIX</Text>
          <Text style={styles.headerTitle}>Pixel Canvas</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Habit Source Selector */}
        <Text style={styles.sectionTitle}>Canvas Source</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <TouchableOpacity
            style={[
              styles.chip,
              selectedHabitId === 'all' && styles.chipActive,
            ]}
            onPress={() => setSelectedHabitId('all')}
          >
            <MaterialCommunityIcons
              name="layers-triple-outline"
              size={14}
              color={selectedHabitId === 'all' ? '#38bdf8' : '#8b949e'}
            />
            <Text
              style={[
                styles.chipText,
                selectedHabitId === 'all' && styles.chipTextActive,
              ]}
            >
              All Habits Combined ({activeHabits.length})
            </Text>
          </TouchableOpacity>

          {activeHabits.map(h => (
            <TouchableOpacity
              key={h.id}
              style={[
                styles.chip,
                selectedHabitId === h.id && styles.chipActive,
              ]}
              onPress={() => setSelectedHabitId(h.id)}
            >
              <MaterialCommunityIcons
                name={(h.icon as any) || 'check'}
                size={14}
                color={selectedHabitId === h.id ? '#38bdf8' : '#8b949e'}
              />
              <Text
                style={[
                  styles.chipText,
                  selectedHabitId === h.id && styles.chipTextActive,
                ]}
              >
                {h.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View Span Selector (30d, 90d, 180d, 1y) */}
        <View style={styles.controlsRow}>
          <Text style={styles.sectionTitle}>Time Window</Text>
          <View style={styles.spanSelector}>
            {(['30days', '90days', '180days', 'year'] as ViewSpan[]).map(span => (
              <TouchableOpacity
                key={span}
                style={[
                  styles.spanBtn,
                  selectedSpan === span && styles.spanBtnActive,
                ]}
                onPress={() => setSelectedSpan(span)}
              >
                <Text
                  style={[
                    styles.spanBtnText,
                    selectedSpan === span && styles.spanBtnTextActive,
                  ]}
                >
                  {span === '30days'
                    ? '30D'
                    : span === '90days'
                    ? '90D'
                    : span === '180days'
                    ? '180D'
                    : '1 YEAR'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* The Big Canvas Card */}
        <View style={styles.canvasCard}>
          <View style={styles.canvasHeader}>
            <View style={styles.canvasTitleGroup}>
              <MaterialCommunityIcons name="grid" size={18} color={activePalette.accent} />
              <Text style={styles.canvasTitle}>
                {selectedHabitId === 'all' ? 'Life Activity Matrix' : 'Habit Contribution Matrix'}
              </Text>
            </View>
            <Text style={styles.canvasSubtitle}>Tap square to inspect/toggle</Text>
          </View>

          {/* Interactive Heatmap Matrix */}
          <View style={styles.gridWrapper}>
            <PixelGrid
              records={compositeRecords}
              paletteKey={
                selectedHabitId !== 'all'
                  ? activeHabits.find(h => h.id === selectedHabitId)?.palette || globalPalette
                  : globalPalette
              }
              span={selectedSpan}
              squareSize={14}
              gap={3.5}
              showLegend={true}
              showDayLabels={true}
              onDayPress={handlePixelPress}
            />
          </View>
        </View>

        {/* Palette Theme Chooser for the Canvas */}
        <Text style={styles.sectionTitle}>Canvas Color Theme</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palettesList}>
          {(Object.keys(PALETTES) as PaletteKey[]).map(key => {
            const pal = PALETTES[key];
            const isSelected = globalPalette === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeButton,
                  isSelected && { borderColor: pal.accent, backgroundColor: '#21262d' },
                ]}
                onPress={() => setGlobalPalette(key)}
              >
                <View style={styles.themeDotRow}>
                  {pal.levels.slice(1).map((lvlColor, idx) => (
                    <View
                      key={idx}
                      style={[styles.themeDot, { backgroundColor: lvlColor }]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.themeName,
                    isSelected && { color: pal.accent, fontWeight: '700' },
                  ]}
                >
                  {pal.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Matrix Insights Metrics */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Matrix Insights</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{canvasStats.totalCompletedDays}</Text>
              <Text style={styles.metricLabel}>Active Days</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, { color: activePalette.accent }]}>
                {canvasStats.totalScore}
              </Text>
              <Text style={styles.metricLabel}>Total Pixels Colored</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>
                {activeHabits.length}
              </Text>
              <Text style={styles.metricLabel}>Tracking Habits</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Day details modal */}
      <DayDetailsModal
        visible={!!dayDetailsModal}
        habit={dayDetailsModal?.habit || null}
        date={dayDetailsModal?.date || ''}
        level={dayDetailsModal?.level || 0}
        onClose={() => setDayDetailsModal(null)}
        onSelectLevel={level => {
          if (dayDetailsModal) {
            toggleRecord(dayDetailsModal.habit.id, dayDetailsModal.date, level);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  headerSubtitle: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#f0f6fc',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    marginRight: 8,
    gap: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38bdf8',
  },
  chipText: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#38bdf8',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  spanSelector: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 2,
  },
  spanBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  spanBtnActive: {
    backgroundColor: '#21262d',
  },
  spanBtnText: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '600',
  },
  spanBtnTextActive: {
    color: '#f0f6fc',
  },
  canvasCard: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 14,
    marginBottom: 20,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  canvasTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  canvasTitle: {
    color: '#f0f6fc',
    fontSize: 15,
    fontWeight: '700',
  },
  canvasSubtitle: {
    color: '#8b949e',
    fontSize: 11,
  },
  gridWrapper: {
    paddingVertical: 4,
  },
  palettesList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  themeButton: {
    backgroundColor: '#161b22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  themeDotRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 4,
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  themeName: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '500',
  },
  insightsCard: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 16,
  },
  insightsTitle: {
    color: '#f0f6fc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricNumber: {
    color: '#f0f6fc',
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
