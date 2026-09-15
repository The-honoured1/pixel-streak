import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Habit } from '../types';
import { PALETTES } from '../constants/palettes';
import { calculateHabitStats } from '../utils/streakCalculator';
import { getLastNDays } from '../utils/dateUtils';
import { FlameStreak } from './FlameStreak';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
  onToggleDate: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  selectedDate,
  onToggleDate,
  onEdit,
}) => {
  const palette = PALETTES[habit.palette] || PALETTES.emerald;
  const stats = calculateHabitStats(habit);
  const isDoneOnSelectedDate = (habit.records[selectedDate] || 0) > 0;
  const last7Days = getLastNDays(7);

  // Bounce scale animation for check button
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleDate(habit.id, selectedDate);
  };

  return (
    <View style={styles.card}>
      {/* Top Row: Icon, Title & Streak, and Big Check Button */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.cardLeft}
          onPress={() => onEdit(habit)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: `${palette.accent}18`,
                borderColor: `${palette.accent}35`,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={(habit.icon as any) || 'fire'}
              size={24}
              color={palette.accent}
            />
          </View>

          <View style={styles.titleInfo}>
            <Text style={styles.habitName} numberOfLines={1}>
              {habit.name}
            </Text>
            {!!habit.description && (
              <Text style={styles.habitDesc} numberOfLines={1}>
                {habit.description}
              </Text>
            )}
            <View style={styles.streakRow}>
              <FlameStreak streak={stats.currentStreak} size="small" />
              {stats.longestStreak > 0 && (
                <Text style={styles.bestStreakText}>Best: {stats.longestStreak}d</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Big Satisfying Check Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              isDoneOnSelectedDate
                ? { backgroundColor: palette.accent, borderColor: palette.accent }
                : styles.checkButtonEmpty,
            ]}
            onPress={handleToggle}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isDoneOnSelectedDate ? (
              <MaterialCommunityIcons name="check-bold" size={20} color="#0B0F19" />
            ) : (
              <View style={[styles.emptyInnerDot, { borderColor: `${palette.accent}50` }]} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Week Dots Strip (Last 7 Days) */}
      <View style={styles.weekStrip}>
        {last7Days.map(item => {
          const isDone = (habit.records[item.date] || 0) > 0;
          const isSelected = item.date === selectedDate;

          return (
            <TouchableOpacity
              key={item.date}
              style={[
                styles.weekDotItem,
                isSelected && styles.weekDotItemSelected,
              ]}
              onPress={() => onToggleDate(habit.id, item.date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.weekDayLabel,
                  isSelected && { color: '#FFFFFF', fontWeight: '800' },
                ]}
              >
                {item.dayLabel}
              </Text>
              <View
                style={[
                  styles.dotSquare,
                  isDone
                    ? { backgroundColor: palette.accent }
                    : styles.dotSquareEmpty,
                  isSelected && !isDone && [styles.dotSquareSelected, { borderColor: palette.accent }],
                ]}
              >
                {isDone && (
                  <MaterialCommunityIcons name="check" size={10} color="#0B0F19" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121624',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  titleInfo: {
    flex: 1,
  },
  habitName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  habitDesc: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 8,
  },
  bestStreakText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  checkButtonEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  emptyInnerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  weekDotItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  weekDotItemSelected: {
    borderRadius: 8,
  },
  weekDayLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  dotSquare: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSquareEmpty: {
    backgroundColor: '#19202F',
  },
  dotSquareSelected: {
    borderWidth: 1.5,
  },
});
