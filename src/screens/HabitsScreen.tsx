import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitContext';
import { HabitCard } from '../components/HabitCard';
import { HabitModal } from '../components/HabitModal';
import { ExportImportModal } from '../components/ExportImportModal';
import { Habit } from '../types';
import { getTodayString, formatDisplayDate, getLastNDays } from '../utils/dateUtils';
import { QUICK_STARTERS, QuickTemplate } from '../constants/defaultHabits';

export const HabitsScreen: React.FC = () => {
  const {
    activeHabits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleArchive,
    toggleRecord,
  } = useHabits();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const today = getTodayString();
  const weekDays = useMemo(() => getLastNDays(7), [today]);

  // Selected date completion summary
  const daySummary = useMemo(() => {
    const total = activeHabits.length;
    const completed = activeHabits.filter(h => (h.records[selectedDate] || 0) > 0).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [activeHabits, selectedDate]);

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitModalVisible(true);
  };

  const handleNewHabit = () => {
    setEditingHabit(null);
    setHabitModalVisible(true);
  };

  const handleToggleHabitForDate = (habitId: string, date: string) => {
    toggleRecord(habitId, date);
  };

  const handleAddQuickStarter = async (starter: QuickTemplate) => {
    await addHabit({
      name: starter.name,
      description: '',
      icon: starter.icon,
      palette: starter.palette,
      frequency: 'daily',
      category: 'General',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const isViewingToday = selectedDate === today;

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Daily Streaks</Text>
          <Text style={styles.headerSubtitle}>
            {isViewingToday ? 'Today' : formatDisplayDate(selectedDate)}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setSettingsModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="cog-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addHabitBtn}
            onPress={handleNewHabit}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#0B0F19" />
            <Text style={styles.addHabitBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Calendar Selector Bar */}
      <View style={styles.weekBar}>
        {weekDays.map(item => {
          const isSelected = item.date === selectedDate;
          const isTodayItem = item.isToday;

          // Count how many habits are done on this day
          const doneCount = activeHabits.filter(h => (h.records[item.date] || 0) > 0).length;
          const allDone = activeHabits.length > 0 && doneCount === activeHabits.length;

          return (
            <TouchableOpacity
              key={item.date}
              style={[
                styles.weekDayTab,
                isSelected && styles.weekDayTabSelected,
                isTodayItem && !isSelected && styles.weekDayTabToday,
              ]}
              onPress={() => setSelectedDate(item.date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.weekDayName,
                  isSelected ? styles.weekDayNameSelected : null,
                ]}
              >
                {item.dayLabel}
              </Text>
              <Text
                style={[
                  styles.weekDayNumber,
                  isSelected ? styles.weekDayNumberSelected : null,
                ]}
              >
                {item.dayNumber}
              </Text>
              <View
                style={[
                  styles.weekDayDot,
                  doneCount > 0 ? styles.weekDayDotDone : null,
                  allDone ? styles.weekDayDotAllDone : null,
                  isSelected && styles.weekDayDotSelected,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Progress Card */}
        {activeHabits.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View>
                <Text style={styles.progressTitle}>
                  {daySummary.completed === daySummary.total && daySummary.total > 0
                    ? 'All habits completed! 🎉'
                    : `${daySummary.completed} of ${daySummary.total} completed`}
                </Text>
                <Text style={styles.progressSubtitle}>
                  {isViewingToday ? 'Keep up your daily routine' : formatDisplayDate(selectedDate)}
                </Text>
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{daySummary.percentage}%</Text>
              </View>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${daySummary.percentage}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Empty State when zero habits */}
        {activeHabits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="lightning-bolt" size={32} color="#10B981" />
            </View>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Start with a clean slate. Tap a starter below or create your own habit:
            </Text>

            <View style={styles.startersGrid}>
              {QUICK_STARTERS.map((starter, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.starterChip}
                  onPress={() => handleAddQuickStarter(starter)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={starter.icon as any}
                    size={18}
                    color="#10B981"
                  />
                  <Text style={styles.starterChipText}>{starter.name}</Text>
                  <MaterialCommunityIcons name="plus" size={16} color="#64748B" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.createCustomBtn}
              onPress={handleNewHabit}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="pencil-plus" size={18} color="#0B0F19" />
              <Text style={styles.createCustomBtnText}>Create Custom Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Habit Cards List */
          activeHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              selectedDate={selectedDate}
              onToggleDate={handleToggleHabitForDate}
              onEdit={handleEditHabit}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create / Edit Habit Modal */}
      <HabitModal
        visible={habitModalVisible}
        habitToEdit={editingHabit}
        onClose={() => {
          setHabitModalVisible(false);
          setEditingHabit(null);
        }}
        onSave={addHabit}
        onUpdate={updateHabit}
        onDelete={deleteHabit}
        onArchive={toggleArchive}
      />

      {/* Settings / Data Modal */}
      <ExportImportModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A10',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090A10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#121624',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 4,
  },
  addHabitBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 14,
  },
  weekBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  weekDayTab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  weekDayTabSelected: {
    backgroundColor: '#10B981',
  },
  weekDayTabToday: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  weekDayName: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  weekDayNameSelected: {
    color: '#0B0F19',
  },
  weekDayNumber: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  weekDayNumberSelected: {
    color: '#0B0F19',
  },
  weekDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  weekDayDotDone: {
    backgroundColor: '#10B981',
  },
  weekDayDotAllDone: {
    backgroundColor: '#38BDF8',
  },
  weekDayDotSelected: {
    backgroundColor: '#0B0F19',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  progressCard: {
    backgroundColor: '#121624',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  progressSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },
  percentBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  percentText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#19202F',
    borderRadius: 999,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 999,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 280,
  },
  startersGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
    justifyContent: 'center',
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121624',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  starterChipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  createCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 24,
    gap: 8,
  },
  createCustomBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 15,
  },
});
