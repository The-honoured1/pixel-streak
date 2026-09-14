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
import { DayDetailsModal } from '../components/DayDetailsModal';
import { ExportImportModal } from '../components/ExportImportModal';
import { Habit } from '../types';
import { getTodayString, formatDisplayDate } from '../utils/dateUtils';
import { CATEGORIES } from '../constants/palettes';

export const HabitsScreen: React.FC = () => {
  const {
    activeHabits,
    archivedHabits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleArchive,
    quickToggleToday,
    toggleRecord,
  } = useHabits();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [dataModalVisible, setDataModalVisible] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Day detail modal state
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    habit: Habit;
    date: string;
    level: number;
  } | null>(null);

  const today = getTodayString();

  // Filtered habits
  const displayedHabits = useMemo(() => {
    const list = showArchived ? archivedHabits : activeHabits;
    if (selectedCategory === 'All') return list;
    return list.filter(h => h.category === selectedCategory);
  }, [activeHabits, archivedHabits, showArchived, selectedCategory]);

  // Today's summary
  const todaySummary = useMemo(() => {
    const total = activeHabits.length;
    const completed = activeHabits.filter(h => (h.records[today] || 0) > 0).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [activeHabits, today]);

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitModalVisible(true);
  };

  const handleNewHabit = () => {
    setEditingHabit(null);
    setHabitModalVisible(true);
  };

  const handleDayPress = (habit: Habit, date: string, level: number) => {
    setSelectedDayInfo({ habit, date, level });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Loading your pixel streaks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>{formatDisplayDate(today)}</Text>
          <Text style={styles.headerTitle}>Daily Streaks</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setDataModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color="#8b949e" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={handleNewHabit}>
            <MaterialCommunityIcons name="plus" size={20} color="#0d1117" />
            <Text style={styles.createButtonText}>Add Habit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Progress Banner */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressLabel}>TODAY'S COMPLETION</Text>
              <Text style={styles.progressValue}>
                {todaySummary.completed} of {todaySummary.total} Completed
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>{todaySummary.percentage}%</Text>
            </View>
          </View>
          {/* Progress bar line */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${todaySummary.percentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {['All', ...CATEGORIES].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat && styles.filterChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View toggle (Active vs Archived) */}
        {archivedHabits.length > 0 && (
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={styles.archivedToggle}
              onPress={() => setShowArchived(!showArchived)}
            >
              <MaterialCommunityIcons
                name={showArchived ? 'eye-outline' : 'archive-outline'}
                size={16}
                color="#8b949e"
              />
              <Text style={styles.archivedToggleText}>
                {showArchived
                  ? `Showing Archived (${archivedHabits.length})`
                  : `View Archived Habits (${archivedHabits.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Habits List */}
        {displayedHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="view-grid-plus-outline" size={48} color="#30363d" />
            <Text style={styles.emptyTitle}>No habits found</Text>
            <Text style={styles.emptySubtitle}>
              {showArchived
                ? 'No archived habits.'
                : 'Create your first habit to begin building your pixel streak!'}
            </Text>
            {!showArchived && (
              <TouchableOpacity style={styles.emptyButton} onPress={handleNewHabit}>
                <Text style={styles.emptyButtonText}>Create New Habit</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayedHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onQuickCheckIn={quickToggleToday}
              onEdit={handleEditHabit}
              onDayPress={handleDayPress}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Habit Create / Edit Modal */}
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

      {/* Day Details Modal */}
      <DayDetailsModal
        visible={!!selectedDayInfo}
        habit={selectedDayInfo?.habit || null}
        date={selectedDayInfo?.date || ''}
        level={selectedDayInfo?.level || 0}
        onClose={() => setSelectedDayInfo(null)}
        onSelectLevel={level => {
          if (selectedDayInfo) {
            toggleRecord(selectedDayInfo.habit.id, selectedDayInfo.date, level);
          }
        }}
      />

      {/* Data Management Modal */}
      <ExportImportModal
        visible={dataModalVisible}
        onClose={() => setDataModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8b949e',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#f0f6fc',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createButtonText: {
    color: '#0d1117',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  progressCard: {
    backgroundColor: '#161b22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 16,
    marginBottom: 16,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressValue: {
    color: '#f0f6fc',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  progressCircle: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressCircleText: {
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: 14,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#21262d',
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 3,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#161b22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  filterChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: '#38bdf8',
  },
  filterChipText: {
    color: '#8b949e',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#38bdf8',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  archivedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  archivedToggleText: {
    color: '#8b949e',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#f0f6fc',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  emptySubtitle: {
    color: '#8b949e',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: '#238636',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
