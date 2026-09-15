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

  // Compute composite records
  const compositeRecords: Record<string, number> = useMemo(() => {
    const records: Record<string, number> = {};

    if (selectedHabitId === 'all') {
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

    return {
      totalCompletedDays,
      totalScore,
    };
  }, [compositeRecords]);

  const activePalette = PALETTES[globalPalette] || PALETTES.emerald;

  const handlePixelPress = (date: string, level: number) => {
    if (selectedHabitId !== 'all') {
      const habit = activeHabits.find(h => h.id === selectedHabitId);
      if (habit) {
        setDayDetailsModal({ habit, date, level });
      }
    } else if (activeHabits.length > 0) {
      setDayDetailsModal({ habit: activeHabits[0], date, level });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>MATRIX STUDIO</Text>
          </View>
          <Text style={styles.headerTitle}>Pixel Canvas</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeHabits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.12)', borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
              <MaterialCommunityIcons name="view-grid-outline" size={32} color="#06B6D4" />
            </View>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Add habits on the Streaks tab to see your visual pixel matrix light up.
            </Text>
          </View>
        ) : (
          <>
            {/* Habit Source Selector */}
            <Text style={styles.sectionTitle}>Canvas Stream</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <TouchableOpacity
            style={[
              styles.chip,
              selectedHabitId === 'all' && [styles.chipActive, { borderColor: activePalette.accent }],
            ]}
            onPress={() => setSelectedHabitId('all')}
          >
            <MaterialCommunityIcons
              name="layers-triple-outline"
              size={15}
              color={selectedHabitId === 'all' ? activePalette.accent : '#64748B'}
            />
            <Text
              style={[
                styles.chipText,
                selectedHabitId === 'all' && [styles.chipTextActive, { color: activePalette.accent }],
              ]}
            >
              All Habits ({activeHabits.length})
            </Text>
          </TouchableOpacity>

          {activeHabits.map(h => (
            <TouchableOpacity
              key={h.id}
              style={[
                styles.chip,
                selectedHabitId === h.id && [styles.chipActive, { borderColor: activePalette.accent }],
              ]}
              onPress={() => setSelectedHabitId(h.id)}
            >
              <MaterialCommunityIcons
                name={(h.icon as any) || 'check'}
                size={15}
                color={selectedHabitId === h.id ? activePalette.accent : '#64748B'}
              />
              <Text
                style={[
                  styles.chipText,
                  selectedHabitId === h.id && [styles.chipTextActive, { color: activePalette.accent }],
                ]}
              >
                {h.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View Span Selector (30d, 90d, 180d, 1y) */}
        <View style={styles.controlsRow}>
          <Text style={styles.sectionTitle}>Time Frame</Text>
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
              <View
                style={[
                  styles.canvasIconCircle,
                  { backgroundColor: `${activePalette.accent}18` },
                ]}
              >
                <MaterialCommunityIcons name="view-grid" size={16} color={activePalette.accent} />
              </View>
              <Text style={styles.canvasTitle}>
                {selectedHabitId === 'all' ? 'Life Activity Matrix' : 'Habit Streak Matrix'}
              </Text>
            </View>
            <Text style={styles.canvasSubtitle}>Tap pixel to inspect</Text>
          </View>

          {/* Heatmap Grid */}
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

        {/* Palette Theme Chooser */}
        <Text style={styles.sectionTitle}>Palette Themes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.palettesList}>
          {(Object.keys(PALETTES) as PaletteKey[]).map(key => {
            const pal = PALETTES[key];
            const isSelected = globalPalette === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeButton,
                  isSelected && { borderColor: pal.accent, backgroundColor: 'rgba(255,255,255,0.06)' },
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
          <Text style={styles.insightsTitle}>Canvas Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{canvasStats.totalCompletedDays}</Text>
              <Text style={styles.metricLabel}>Active Days</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, { color: activePalette.accent }]}>
                {canvasStats.totalScore}
              </Text>
              <Text style={styles.metricLabel}>Total Pixels</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>
                {activeHabits.length}
              </Text>
            </View>
          </View>
        </View>
        </>
      )}

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
    backgroundColor: '#0A0D14',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  headerTagText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#FFFFFF',
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
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
    backgroundColor: '#131824',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
    gap: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  spanSelector: {
    flexDirection: 'row',
    backgroundColor: '#131824',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 2,
  },
  spanBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  spanBtnActive: {
    backgroundColor: '#1E2536',
  },
  spanBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  spanBtnTextActive: {
    color: '#FFFFFF',
  },
  canvasCard: {
    backgroundColor: '#131824',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 20,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  canvasTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  canvasIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  canvasSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  gridWrapper: {
    paddingVertical: 4,
  },
  palettesList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  themeButton: {
    backgroundColor: '#131824',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
    alignItems: 'center',
  },
  themeDotRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 5,
  },
  themeDot: {
    width: 8,
    height: 8,
    borderRadius: 2.5,
  },
  themeName: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  insightsCard: {
    backgroundColor: '#131824',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
  },
  insightsTitle: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});
