import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Habit } from '../types';
import { PALETTES } from '../constants/palettes';
import { formatDisplayDate } from '../utils/dateUtils';

interface DayDetailsModalProps {
  visible: boolean;
  habit: Habit | null;
  date: string;
  level: number;
  onClose: () => void;
  onSelectLevel: (level: number) => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  visible,
  habit,
  date,
  level,
  onClose,
  onSelectLevel,
}) => {
  if (!habit || !visible) return null;

  const palette = PALETTES[habit.palette] || PALETTES.emerald;
  const levelLabels = ['None', 'Light', 'Moderate', 'Substantial', 'Max / Complete'];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.habitHeader}>
              <MaterialCommunityIcons
                name={(habit.icon as any) || 'check-circle-outline'}
                size={20}
                color={palette.accent}
              />
              <Text style={styles.habitName} numberOfLines={1}>
                {habit.name}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color="#8b949e" />
            </TouchableOpacity>
          </View>

          {/* Date info */}
          <Text style={styles.dateLabel}>{formatDisplayDate(date)}</Text>
          <Text style={styles.instruction}>
            Select pixel intensity or complete this day:
          </Text>

          {/* Intensity selector blocks */}
          <View style={styles.intensityRow}>
            {[0, 1, 2, 3, 4].map(lvl => {
              const isSelected = level === lvl;
              const bgColor = palette.levels[lvl];

              return (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.intensityBox,
                    { backgroundColor: bgColor },
                    isSelected && [styles.intensityBoxSelected, { borderColor: palette.accent }],
                  ]}
                  onPress={() => {
                    onSelectLevel(lvl);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.intensityNum,
                      { color: lvl === 0 ? '#6e7681' : lvl >= 3 ? '#ffffff' : '#e6edf3' },
                    ]}
                  >
                    {lvl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Intensity:</Text>
            <Text style={[styles.statusValue, { color: palette.accent }]}>
              {levelLabels[level] || 'None'} ({level}/4)
            </Text>
          </View>

          {/* Quick Action Button */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                level > 0 ? styles.toggleBtnActive : styles.toggleBtnEmpty,
              ]}
              onPress={() => {
                onSelectLevel(level > 0 ? 0 : 4);
                onClose();
              }}
            >
              <MaterialCommunityIcons
                name={level > 0 ? 'close-circle-outline' : 'check-circle-outline'}
                size={18}
                color={level > 0 ? '#f85149' : '#ffffff'}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: level > 0 ? '#f85149' : '#ffffff' },
                ]}
              >
                {level > 0 ? 'Clear This Day' : 'Mark Completed (Level 4)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#161b22',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    width: '100%',
    maxWidth: 380,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  habitName: {
    color: '#c9d1d9',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  dateLabel: {
    color: '#f0f6fc',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  instruction: {
    color: '#8b949e',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 16,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 10,
  },
  intensityBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#30363d',
  },
  intensityBoxSelected: {
    borderWidth: 2.5,
    transform: [{ scale: 1.05 }],
  },
  intensityNum: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#21262d',
  },
  statusLabel: {
    color: '#8b949e',
    fontSize: 13,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    marginTop: 16,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleBtnEmpty: {
    backgroundColor: '#238636',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderWidth: 1,
    borderColor: '#f85149',
  },
  toggleBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
