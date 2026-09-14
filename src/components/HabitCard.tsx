import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Habit } from '../types';
import { PALETTES } from '../constants/palettes';
import { calculateHabitStats } from '../utils/streakCalculator';
import { getTodayString } from '../utils/dateUtils';
import { PixelGrid } from './PixelGrid';
import { FlameStreak } from './FlameStreak';

interface HabitCardProps {
  habit: Habit;
  onQuickCheckIn: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDayPress: (habit: Habit, date: string, level: number) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onQuickCheckIn,
  onEdit,
  onDayPress,
}) => {
  const palette = PALETTES[habit.palette] || PALETTES.emerald;
  const stats = calculateHabitStats(habit);
  const today = getTodayString();
  const isDoneToday = (habit.records[today] || 0) > 0;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.leftInfo}>
          <View style={[styles.iconContainer, { backgroundColor: `${palette.accent}15`, borderColor: `${palette.accent}30` }]}>
            <MaterialCommunityIcons
              name={(habit.icon as any) || 'check-circle-outline'}
              size={20}
              color={palette.accent}
            />
          </View>
          <View style={styles.titleInfo}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.habitName} numberOfLines={1}>
                {habit.name}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {habit.category || 'General'} • {habit.frequency}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Check-in Button & Edit */}
        <View style={styles.actionRow}>
          <FlameStreak streak={stats.currentStreak} size="small" />
          
          <TouchableOpacity
            style={[
              styles.checkInButton,
              isDoneToday && { backgroundColor: palette.accent, borderColor: palette.accent },
            ]}
            onPress={() => onQuickCheckIn(habit.id)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isDoneToday ? 'check-bold' : 'plus'}
              size={18}
              color={isDoneToday ? '#0d1117' : '#8b949e'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => onEdit(habit)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="dots-vertical" size={18} color="#8b949e" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description if present */}
      {!!habit.description && (
        <Text style={styles.description} numberOfLines={1}>
          {habit.description}
        </Text>
      )}

      {/* Stats summary bar */}
      <View style={styles.statsSummaryRow}>
        <View style={styles.statPill}>
          <Text style={styles.statPillLabel}>Best</Text>
          <Text style={styles.statPillValue}>{stats.longestStreak}d</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statPillLabel}>Total</Text>
          <Text style={styles.statPillValue}>{stats.totalCompletions}</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statPillLabel}>30d Rate</Text>
          <Text style={[styles.statPillValue, { color: palette.accent }]}>
            {stats.completionRate}%
          </Text>
        </View>
      </View>

      {/* Pixel Heatmap Matrix */}
      <View style={styles.matrixContainer}>
        <PixelGrid
          records={habit.records}
          paletteKey={habit.palette}
          span="90days"
          squareSize={12}
          gap={3}
          showLegend={false}
          showDayLabels={true}
          onDayPress={(date, level) => onDayPress(habit, date, level)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 14,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleInfo: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitName: {
    color: '#f0f6fc',
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    color: '#8b949e',
    fontSize: 12,
  },
  description: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkInButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#30363d',
    backgroundColor: '#21262d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    padding: 4,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1117',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#30363d',
    gap: 4,
  },
  statPillLabel: {
    color: '#8b949e',
    fontSize: 10,
    fontWeight: '500',
  },
  statPillValue: {
    color: '#c9d1d9',
    fontSize: 11,
    fontWeight: '700',
  },
  matrixContainer: {
    marginTop: 6,
  },
});
